// XF GTI			-       1
// XR GT			-       2
// XR GT TURBO		-       4
// RB4 GT			-       8
// FXO TURBO		-    0x10
// LX4				-    0x20
// LX6				-    0x40
// MRT5				-    0x80
// UF 1000			-   0x100
// RACEABOUT		-   0x200
// FZ50				-   0x400
// FORMULA XR		-   0x800
// XF GTR			-  0x1000
// UF GTR			-  0x2000
// FORMULA V8		-  0x4000
// FXO GTR			-  0x8000
// XR GTR			- 0x10000
// FZ50 GTR			- 0x20000
// BMW SAUBER F1.06	- 0x40000
// FORMULA BMW FB02	- 0x80000

export enum PlayerCar {
    UF1 = 0x100,
    XFG = 1,
    XRG = 2,
    XRT = 4,
    RB4 = 8,
    FXO = 0x10,
    LX4 = 0x20,
    LX6 = 0x40,
    MRT = 0x80,
    RAC = 0x200,
    FZ5 = 0x400,
    FOX = 0x800,
    XFR = 0x1000,
    UFR = 0x2000,
    FO8 = 0x4000,
    FXR = 0x8000,
    XRR = 0x10000,
    FZR = 0x20000,
    BF1 = 0x40000,
    FBM = 0x80000,
    ALL = 0xffffffff,
}
