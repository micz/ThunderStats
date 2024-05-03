export const tsBarPosition = {
    id: "tsBarPosition",
    afterUpdate(chart, args, options) {
        chart.data.datasets.forEach((dataset, dsIndex) => {
                const meta = chart.getDatasetMeta(dsIndex);
                meta.data.forEach(bar => {
                    switch(dataset.tsID){
                        case 'ts':
                            bar.x = bar.x - (2 * bar.width);
                            bar.width *= 2;
                            break;
                        case 'tr':
                            bar.x = bar.x - bar.width;
                            bar.width *= 2;
                            break;
                        case 'ys':
                            bar.x = bar.x + bar.width*3/4;
                            break;
                        case 'yr':
                            bar.x = bar.x + (3 * bar.width/2);
                            break;
                    }
                });
        });
    }

}