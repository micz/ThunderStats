const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');
  
    if (!listContainer) {
      listContainer = document.createElement('ul');
      listContainer.style.margin = 0;
      listContainer.style.padding = 0;
  
      legendContainer.appendChild(listContainer);
    }
  
    return listContainer;
  };

  function replaceLabelString(text) {
    let newValue = text;

    switch (newValue) {
      case 'tsent':
      case 'ysent':
        newValue = browser.i18n.getMessage('TimeGraph.Sent');
        break;
      case 'trcvd':
      case 'yrcvd':
        newValue = browser.i18n.getMessage('TimeGraph.Rcvd');
        break;
      default:
        break;
    }
    return newValue;
  }
  
  export const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        //console.log(">>>>>>>>>>>>> containerID: " + options.containerID);
      const ul = getOrCreateLegendList(chart, options.containerID);
  
      // Remove old legend items
      while (ul.firstChild) {
        ul.firstChild.remove();
      }
  
      // Reuse the built-in legendItems generator
      const items = chart.options.plugins.legend.labels.generateLabels(chart);
  
      items.forEach((item,i) => {

        if((i == 0) || (i == 2)) {
            const li_ty = document.createElement('li');
            li_ty.classList.add('day_today_title');
            if(i==2){
              li_ty.classList.add('day_today_title_yesterday');
            }
            li_ty.innerHTML = ((i == 0) && options.is_today) ? browser.i18n.getMessage('Today') : browser.i18n.getMessage('Yesterday');
            ul.appendChild(li_ty);
          }

        const li = document.createElement('li');
        li.style.alignItems = 'center';
        li.style.cursor = 'pointer';
  
        li.onclick = () => {
          const {type} = chart.config;
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
          chart.update();
        };
  
        // Color box
        const boxSpan = document.createElement('span');
        boxSpan.style.background = item.fillStyle;
        boxSpan.style.borderColor = item.strokeStyle;
        boxSpan.style.borderWidth = item.lineWidth + 'px';
        boxSpan.style.display = 'inline-block';
        boxSpan.style.flexShrink = 0;
        boxSpan.style.height = '10px';
        boxSpan.style.marginRight = '5px';
        boxSpan.style.width = '10px';
  
        // Text
        const textContainer = document.createElement('span');
        textContainer.style.color = item.fontColor;
        textContainer.style.margin = 0;
        textContainer.style.padding = 0;
        textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
  
        const text = document.createTextNode(replaceLabelString(item.text));
        textContainer.appendChild(text);
  
        li.appendChild(boxSpan);
        li.appendChild(textContainer);
        ul.appendChild(li);
      });
    }
  };