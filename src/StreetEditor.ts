/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { readFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { black, lightGreen, red, reset, white, yellow } from './colors';
import Connection from './Connection';
import sendMessageToConnection from './helpers/sendMessageToConnection';
import { ObjectInfoProps } from './packets/helpers/ObjectInfo';
import getDistanceMeters from './utils/getDistanceMeters';
import {
    createComponent,
    deleteComponent,
    ProxiedUiComponent,
    UiComponentProps,
} from './utils/ui';

type Point = {
    id: string;
    x: number;
    y: number;
    z: number;
    streetName?: string;
    connections: string[];
    streetId?: string;
};

let streets = JSON.parse(
    readFileSync('data/streets.json', 'utf-8') || '[]',
) as {
    id: string;
    name: string;
    points: Point[];
}[];

export class StreetEditor {
    constructor(connection: Connection) {
        this.connection = connection;

        this.drawUI();
        this.updateScreenPoints();
    }

    drawUI() {
        this.ui = createComponent({
            connectionId: this.connection.id,
            props: {
                height: 5,
                left: 70,
                top: -5,
                width: 10,
                stickTo: ['bottom', 'left'],
                isVirtual: true,
                flow: 'right',
                children: [
                    {
                        name: 'streetName',
                        style: 'light',
                        height: 5,
                        width: 35,
                        text: '',
                    },
                    {
                        name: 'createStreet',
                        height: 5,
                        width: 20,
                        style: 'light',
                        text: `${lightGreen}+ ${black}Criar rua`,
                        typeInMax: 100,
                        typeInDescription: 'Digite o nome da rua',
                        onType: (createStreetButton, { text }) => {
                            this.findingPoint = false;
                            this.editing = true;
                            this.updateScreenPoints();
                            const findClosestButton =
                                this.ui.getChild('findClosest');
                            findClosestButton.text = `${black}Conectar ruas`;

                            const saveButton = this.ui.getChild('save');
                            saveButton.text = `${black}Salvar rua`;
                            saveButton.style = 'light';
                            saveButton.onClick = this.handleSave;

                            const streetName = this.ui.getChild('streetName');
                            streetName.text = `${black}Editando: ${text}`;
                            createStreetButton.typeInMax = 0;
                            createStreetButton.text = `${red}^H¡´ ${black}Cancelar`;
                            streetName.state.value = text;
                        },
                        onClick: (createStreetButton) => {
                            const saveStreetButton = this.ui.getChild('save');

                            createStreetButton.typeInMax = 100;
                            createStreetButton.text = `${lightGreen}+ ${black}Criar rua`;

                            const streetName = this.ui.getChild('streetName');
                            streetName.text = '';
                            streetName.state.value = null;

                            saveStreetButton.style = null;
                            saveStreetButton.onClick = null;
                            saveStreetButton.text = '';

                            this.editing = false;
                            this.points = [];
                        },
                    },
                    {
                        name: 'findClosest',
                        height: 5,
                        width: 30,
                        text: `${black}Conectar ruas`,
                        style: 'light',
                        onClick: (button) => {
                            this.findingPoint = !this.findingPoint;
                            button.text = this.findingPoint
                                ? `${red}^H¡´ ${black}Cancelar`
                                : `${black}Conectar ruas`;
                            this.editing = true;
                            this.points = [];
                        },
                    },
                    {
                        name: 'save',
                        height: 5,
                        width: 20,
                        text: '',
                    },
                ],
            },
        });
    }

    handleSave = async () => {
        this.editing = false;
        const saveButton = this.ui.getChild('save');
        const createStreetButton = this.ui.getChild('createStreet');

        saveButton.text = '';
        saveButton.style = null;
        saveButton.onClick = null;

        const streetNameButton = saveButton.parent.getChild('streetName');
        streetNameButton.text = '';
        const streetName: string = streetNameButton.state.value;
        streetNameButton.state.value = null;

        createStreetButton.typeInMax = 100;
        createStreetButton.text = `${lightGreen}+ ${black}Criar rua`;

        const oldStreet = streets.find(({ name }) => name === streetName);

        streets = [
            ...streets.filter(({ id }) => id !== oldStreet?.id),
            {
                ...(oldStreet ?? {
                    id: Math.trunc(Math.random() * 100000000000).toString(16),
                    name: streetName,
                }),
                points: this.points,
            },
        ];
        await writeFile(
            'data/streets.json',
            JSON.stringify(
                [
                    ...streets.map((street) => ({
                        ...street,
                        points: street.points.map((point) => ({
                            ...point,
                            streetId: undefined,
                            streetName: undefined,
                        })),
                    })),
                ],
                null,
                4,
            ),
        );
        this.points = [];
    };

    async handlePosition({ position }: ObjectInfoProps) {
        if (!this.findingPoint) {
            this.points = [
                ...this.points,
                {
                    ...position,
                    id: Math.trunc(Math.random() * 100000000000).toString(16),
                    connections: [],
                },
            ];
            return;
        }

        if (this.points.length === 2) {
            sendMessageToConnection(
                `${yellow}| ${white}Só é possível selecionar duas ruas por vez.`,
                this.connection,
                'warning',
            );
            return;
        }

        // const data = JSON.parse(await readFile('data/streets.json', 'utf-8'));

        let closestPoint = streets[0]?.points[0]
            ? ({
                  ...streets[0].points[0],
                  streetName: streets[0].name,
                  streetId: streets[0].id,
              } as Point)
            : null;
        let closestDistance = closestPoint
            ? getDistanceMeters(position, closestPoint)
            : null;
        for (const street of streets) {
            for (const point of street.points) {
                const distance = getDistanceMeters(point, position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = {
                        ...point,
                        streetName: street.name,
                        streetId: street.id,
                    };
                }
            }
        }
        if (!closestPoint || closestDistance > 50) {
            sendMessageToConnection(
                `${red}| ${white}Nenhum ponto encontrado.`,
                this.connection,
                'error',
            );
            return;
        }
        this.points = [...this.points, closestPoint];
    }

    private _points: Point[] = [];

    updateScreenPoints() {
        deleteComponent(this.pointComponent);
        const pointsAlreadyConnected =
            this.findingPoint &&
            (this.points[0]?.connections?.includes(this.points[1]?.id) ||
                this.points[1]?.connections?.includes(this.points[0]?.id));

        this.pointComponent = createComponent({
            connectionId: this.connection.id,
            props: {
                left: 0,
                centerSelf: ['vertical'],
                height: 100,
                width: 40,
                isVirtual: true,
                flow: 'bottom',
                children: [
                    {
                        height: 5,
                        width: 33,
                        style: 'light',
                        text: !this.editing ? `${black}Ruas` : `${black}Pontos`,
                    },
                    ...(!this.editing
                        ? streets.map<UiComponentProps>(
                              ({ id, name, points }) => ({
                                  height: 5,
                                  width: 0,
                                  isVirtual: true,
                                  flow: 'right',
                                  children: [
                                      {
                                          height: 5,
                                          width: 33,
                                          style: 'light',
                                          text: `${white}${name}`,
                                          align: 'left',
                                          onClick: () => {
                                              this.editing = true;
                                              this.ui.getChild(
                                                  'streetName',
                                              ).text = `${black}Editando ${name}`;

                                              const saveButton =
                                                  this.ui.getChild('save');
                                              saveButton.text = `${black}Salvar rua`;
                                              saveButton.style = 'light';
                                              saveButton.onClick =
                                                  this.handleSave;

                                              const streetNameButton =
                                                  this.ui.getChild(
                                                      'streetName',
                                                  );
                                              streetNameButton.state.value =
                                                  name;

                                              const createStreetButton =
                                                  this.ui.getChild(
                                                      'createStreet',
                                                  );
                                              createStreetButton.text = `${red}^H¡´ ${black}Cancelar`;
                                              createStreetButton.typeInMax = 0;
                                              this.points = points.map(
                                                  (point) => ({
                                                      ...point,
                                                      streetName: name,
                                                      streetId: id,
                                                  }),
                                              );
                                          },
                                      },
                                  ],
                              }),
                          )
                        : []),
                    ...this.points.map<UiComponentProps>(
                        ({ x, y, z, streetName }, index) => ({
                            height: 5,
                            width: 0,
                            isVirtual: true,
                            flow: 'right',
                            children: [
                                {
                                    height: 5,
                                    width: this.findingPoint ? 33 : 30,
                                    style: 'light',
                                    text: this.findingPoint
                                        ? `${white}${streetName}`
                                        : `${white}X: ${lightGreen}${x}${white} Y: ${lightGreen}${y} ${white}Z: ${lightGreen}${z}`,
                                    align: 'left',
                                },
                                !this.findingPoint
                                    ? {
                                          height: 5,
                                          width: 3,
                                          style: 'light',
                                          text: `${white}^J~`,
                                          align: 'left',
                                          onClick: () => {
                                              this.points = this.points.filter(
                                                  (p, i) => i !== index,
                                              );
                                          },
                                      }
                                    : undefined,
                            ],
                        }),
                    ),

                    this.findingPoint && this.points.length === 2
                        ? {
                              height: 5,
                              width: 33,
                              text: pointsAlreadyConnected
                                  ? `${reset}Pontos já conectados`
                                  : `${black}Conectar`,
                              style: 'light',
                              onClick: !pointsAlreadyConnected
                                  ? () => {
                                        this.points[0].connections.push(
                                            this.points[1].id,
                                        );
                                        this.points[1].connections.push(
                                            this.points[0].id,
                                        );
                                        writeFile(
                                            'data/streets.json',
                                            JSON.stringify(streets, null, 4),
                                        );
                                        this.points = [];
                                        const findClosestButton =
                                            this.ui.getChild('findClosest');
                                        findClosestButton.text = `${black}Conectar ruas`;
                                    }
                                  : null,
                          }
                        : undefined,
                ],
            },
        });
    }

    setVisible(visible: boolean) {
        if (!visible) {
            deleteComponent(this.ui);
            this.points = [];
            return;
        }
        this.updateScreenPoints();
        this.drawUI();
    }

    get points() {
        return this._points;
    }

    set points(value) {
        this._points = value;
        this.updateScreenPoints();
    }

    private pointComponent: ProxiedUiComponent;

    private findingPoint = false;

    private editing = false;

    private connection: Connection;

    ui: ProxiedUiComponent;
}
