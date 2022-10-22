import axios from 'axios';
import * as cheerio from 'cheerio';
import { URLSearchParams } from 'url';
import log from '../log';
import prisma from '../prisma';

export default async function downloadModsInfo() {
    const redirectResponse = await axios.post(
        'https://www.lfs.net/files/vehmods',
        new URLSearchParams({
            sort: 'Publish Date',
            showLevel: '0', // Show all
            showClass: '-1', // Class all
            incTweakMod: '1', // Include tweak mods
        }),
        {
            maxRedirects: 0,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            validateStatus: (status) => status === 302,
        },
    );
    const res = await axios.get('https://www.lfs.net/files/vehmods', {
        headers: {
            cookie: redirectResponse.headers['set-cookie'],
        },
    });

    const $ = cheerio.load(res.data);
    const carDivs = $('.ContentArticle2').children().slice(1, -1);

    const cars = [...carDivs]
        .map((carDiv) => {
            const firstDiv = carDiv.children.find((c) => c.type === 'tag');
            if (firstDiv?.type !== 'tag') {
                return null;
            }
            const { href } = firstDiv.attribs;
            const skinId = href.slice(href.lastIndexOf('/') + 1);

            const pictureDiv = firstDiv.children.find((c) => c.type === 'tag');
            if (pictureDiv?.type !== 'tag') {
                return null;
            }
            const { style } = pictureDiv.attribs;
            const pictureUrl = style.slice(
                style.indexOf('/'),
                style.lastIndexOf('/'),
            );
            const nameDiv = pictureDiv.children.find(
                (c) =>
                    c.type === 'tag' &&
                    c.attribs.class === 'CarTrackSelectName',
            );
            if (nameDiv?.type !== 'tag') {
                return null;
            }
            const nameElement = nameDiv.children.find((c) => c.type === 'text');
            if (nameElement?.type !== 'text') {
                return null;
            }
            const name = nameElement.data.slice(2);

            return { skinId, picture: pictureUrl, name };
        })
        .filter(Boolean);

    const result = await prisma.car.createMany({
        data: cars,
        skipDuplicates: true,
    });
    if (result.count > 0) {
        log.info(`Found ${result.count} new cars in mod list`);
    }
    return {
        newModCount: result.count,
    };
}
