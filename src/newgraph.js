import * as d3 from 'd3';

export interface Weights {
  id: string;
  userId: string;
  date: string;
  weight: number;
}

const margin = { top: 20, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.right - margin.left;
const graphHeight = 360 - margin.top - margin.bottom;

const formatTime = d3.timeFormat('%b %d');

const div = d3
  .select('body')
  .append('div')
  .attr(
    'class',
    'absolute text-center w-16 p-1 font-sans text-xs text-myLight bg-myDark rounded-lg pointer-events-none',
  )
  .style('opacity', 0);

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// axes groups
const xAxisGroup = graph
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0,' + graphHeight + ')');

const yAxisGroup = graph.append('g').attr('class', 'y-axis');

// line path element
const path = graph
  .append('path')
  .attr('fill', 'none')
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('stroke', '#00a8cc')
  .attr('stroke-width', '6');

// // create dotted line group and append to graph
// const dottedLines = graph
//   .append('g')
//   .attr('class', 'lines')
//   .style('opacity', 0);

// // create x dotted line and append to dotted line group
// const xDottedLine = dottedLines
//   .append('line')
//   .attr('stroke', '#555')
//   .attr('stroke-width', 0.5)
//   .attr('stroke-dasharray', 1);

// // create y dotted line and append to dotted line group
// const yDottedLine = dottedLines
//   .append('line')
//   .attr('stroke', '#555')
//   .attr('stroke-width', 0.5)
//   .attr('stroke-dasharray', 1);

// update functions

// update scales
function updateScales(data: Weights[]) {
  // scale domains
  const x = d3
    .scaleTime()
    .range([0, graphWidth])
    .domain(d3.extent(data, (d) => new Date(d.date)));
  const y = d3
    .scaleLinear()
    .range([graphHeight, 0])
    .domain([0, d3.max(data, (d) => d.weight)]);

  return { x, y };
}

// create line
function createLine(x, y) {
  // d3 line path generator
  return d3
    .line()
    .curve(d3.curveCardinal)
    .x(function (d) {
      return x(new Date(d.date));
    })
    .y(function (d) {
      return y(d.weight);
    });
}

// update axes
function updateAxes(data, graph, x, y) {
  // axes groups
  XAx.select('.x-axis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(
      d3
        .axisBottom(x)
        .ticks(8)
        .tickFormat(d3.timeFormat('%b %d'))
        .tickSizeOuter(0)
        .tickPadding(5),
    );

  graph
    .select('y-axis')
    .attr('class', 'y-axis')
    .call(
      d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => d)
        .tickSizeOuter(0)
        .tickPadding(5),
    );
}

function updatePath(data, line) {
  const updatedPath = d3.select('path').interrupt().datum(data).attr('d', line);

  const pathLength = path.node().getTotalLength();
  const transitionPath = d3.transition().ease(d3.easeSin).duration(2500);

  // update path data
  updatedPath
    .attr('stroke-dashoffset', pathLength)
    .attr('stroke-dasharray', pathLength)
    .transition(transitionPath)
    .attr('stroke-dashoffset', 0);
}

function updateCircles(data) {
  // create circles for points
  const circles = graph.selectAll('circle').data(data);
  // remove unwanted points
  circles.exit().remove();

  // update current points
  circles
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.weight))
    .attr('fill', (d) => {
      // Compare data changes, and style circle based on day by day progress
      const index = data.findIndex((w) => w.id == d.id);
      if (index === 0) {
        return 'green';
      } else if (data[index - 1].weight < data[index].weight) {
        return 'red';
      } else {
        return 'green';
      }
    });

  // add new points
  circles
    .enter()
    .append('circle')
    .attr('r', '8')
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.weight))
    .attr('fill', (d) => {
      // Compare data changes, and style circle based on day by day progress
      const index = data.findIndex((w) => w.id == d.id);
      if (index === 0) {
        return 'green';
      } else if (data[index - 1].weight < data[index].weight) {
        return 'red';
      } else {
        return 'green';
      }
    });

  // add event listeners to circle (and show dotted lines)
  graph.selectAll('circle').on('mouseover', function (event, d) {
    div.transition().duration(200).style('opacity', 0.9);
    div
      .html(formatTime(new Date(d.date)) + '<br/>' + d.weight)
      .style('left', event.pageX + 'px')
      .style('top', event.pageY - 28 + 'px');

    d3.select(event.currentTarget)
      .transition()
      .duration(100)
      .attr('r', 12)
      .attr('fill', (d) => {
        // Compare data changes, and style circle based on day by day progress
        const index = data.findIndex((w) => w.id == d.id);
        if (index === 0) {
          return 'green';
        } else if (data[index - 1].weight < data[index].weight) {
          return 'red';
        } else {
          return 'green';
        }
      });
  });
}

function updateChart(data: Weights[]) {
  console.log(data);
  data.sort((a, b) => new Date(a.date) - new Date(b.date));
  const { x, y } = updateScales(data);
  const line = createLine(x, y);
  updateAxes(data, graph, x, y);
  updatePath(data, line);
}

// create circles for points
// const circles = graph.selectAll('circle').data(data);

// // remove unwanted points
// circles.exit().remove();

// // update current points
// circles
//   .attr('cx', (d) => x(new Date(d.date)))
//   .attr('cy', (d) => y(d.weight))
//   .attr('fill', (d) => {
//     // Compare data changes, and style circle based on day by day progress
//     const index = data.findIndex((w) => w.id == d.id);
//     if (index === 0) {
//       return 'green';
//     } else if (data[index - 1].weight < data[index].weight) {
//       return 'red';
//     } else {
//       return 'green';
//     }
//   });

// // add new points
// circles
//   .enter()
//   .append('circle')
//   .attr('r', '8')
//   .attr('cx', (d) => x(new Date(d.date)))
//   .attr('cy', (d) => y(d.weight))
//   .attr('fill', (d) => {
//     // Compare data changes, and style circle based on day by day progress
//     const index = data.findIndex((w) => w.id == d.id);
//     if (index === 0) {
//       return 'green';
//     } else if (data[index - 1].weight < data[index].weight) {
//       return 'red';
//     } else {
//       return 'green';
//     }
//   });

// // add event listeners to circle (and show dotted lines)
// graph
//   .selectAll('circle')
//   .on('mouseover', function (event, d) {
//     div.transition().duration(200).style('opacity', 0.9);
//     div
//       .html(formatTime(new Date(d.date)) + '<br/>' + d.weight)
//       .style('left', event.pageX + 'px')
//       .style('top', event.pageY - 28 + 'px');

//     d3.select(event.currentTarget)
//       .transition()
//       .duration(100)
//       .attr('r', 12)
//       .attr('fill', (d) => {
//         // Compare data changes, and style circle based on day by day progress
//         const index = data.findIndex((w) => w.id == d.id);
//         if (index === 0) {
//           return 'green';
//         } else if (data[index - 1].weight < data[index].weight) {
//           return 'red';
//         } else {
//           return 'green';
//         }
//       });
// set x dotted line coords (x1,x2,y1,y2)
//   xDottedLine
//     .attr('x1', x(new Date(d.date)))
//     .attr('x2', x(new Date(d.date)))
//     .attr('y1', graphHeight)
//     .attr('y2', y(d.weight));
//   yDottedLine
//     .attr('x1', 0)
//     .attr('x2', x(new Date(d.date)))
//     .attr('y1', y(d.weight))
//     .attr('y2', y(d.weight));
//   // show the dotted line group (opacity)
//   dottedLines.style('opacity', 1);
// })
// .on('mouseout', function (d) {
//   div.transition().duration(500).style('opacity', 0);
// })
// .on('mouseleave', (event, d) => {
//   d3.select(event.currentTarget)
//     .transition()
//     .duration(100)
//     .attr('r', 8)
//     .attr('fill', (d) => {
//       // Compare data changes, and style circle based on day by day progress
//       const index = data.findIndex((w) => w.id == d.id);
//       if (index === 0) {
//         return 'green';
//       } else if (data[index - 1].weight < data[index].weight) {
//         return 'red';
//       } else {
//         return 'green';
//       }
//     });
//   // hide the dotted line group (opacity)
//   dottedLines.style('opacity', 0);
// });

// // create axes
// const xAxis = d3
//   .axisBottom(x)
//   .ticks(8)
//   .tickFormat(d3.timeFormat('%b %d'))
//   .tickSizeOuter(0)
//   .tickPadding(5);

// const yAxis = d3
//   .axisLeft(y)
//   .ticks(8)
//   .tickFormat((d) => d)
//   .tickSizeOuter(0)
//   .tickPadding(5);

// // rotate axis text
// xAxisGroup
//   .selectAll('text')
//   .attr('transform', 'rotate(-35)')
//   .attr('text-anchor', 'end');

// x and y axis path styling
// xAxisGroup
//   .select('.domain')
//   .attr('class', 'stroke-current text-myBlue stroke-2');
// yAxisGroup
//   .select('.domain')
//   .attr('class', 'stroke-current text-myBlue stroke-2');

// // x and y axis tick
// xAxisGroup
//   .selectAll('.tick')
//   .attr('class', 'stroke-current text-myBright stroke-2')
//   .attr('class', 'font-thin text-myBright');

// yAxisGroup
//   .selectAll('.tick')
//   .attr('class', 'stroke-current text-colors-myBright stroke-2')
//   .attr('class', 'font-thin text-myBright');

export { updateChart };
