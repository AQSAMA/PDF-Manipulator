import { useEffect, useRef, useState } from 'react';

const usePdfWorker = () => {
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(false);
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/pdfWorker.js', import.meta.url));

        workerRef.current.onmessage = (event) => {
            const { data } = event;
            if (data.type === 'pdfProcessed') {
                setPdfData(data.payload);
                setLoading(false);
            }
        };

        return () => {
            workerRef.current.terminate();
        };
    }, []);

    const processPdf = (file) => {
        setLoading(true);
        workerRef.current.postMessage({ type: 'processPdf', payload: file });
    };

    return { pdfData, loading, processPdf };
};

export default usePdfWorker;