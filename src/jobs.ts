export interface Job {
    destination: number;
    maxPayout: number;
    minPayout: number;
    timeout: number;
}

const jobs: Job[] = [
    {
        destination: 1,
        maxPayout: 30000,
        minPayout: 15000,
        timeout: 18000,
    },
    {
        destination: 2,
        maxPayout: 40000,
        minPayout: 25000,
        timeout: 18000,
    },
    {
        destination: 3,
        maxPayout: 50000,
        minPayout: 15000,
        timeout: 18000,
    },
    {
        destination: 5,
        maxPayout: 100000,
        minPayout: 35000,
        timeout: 18000,
    },
];
export default jobs;
