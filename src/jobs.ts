export interface Job {
    destination: number;
    maxPayout: number;
    minPayout: number;
    timeout: number;
}

const jobs: Job[] = [
    {
        destination: 1,
        maxPayout: 300_00,
        minPayout: 150_00,
        timeout: 120_000,
    },
    {
        destination: 2,
        maxPayout: 400_00,
        minPayout: 250_00,
        timeout: 120_000,
    },
    {
        destination: 3,
        maxPayout: 500_00,
        minPayout: 150_00,
        timeout: 120_000,
    },
    {
        destination: 5,
        maxPayout: 1000_00,
        minPayout: 350_00,
        timeout: 120_000,
    },
];
export default jobs;
