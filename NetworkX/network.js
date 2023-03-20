
function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links, (d)=>{
       if(node_degree.hasOwnProperty(d.source))
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(node_degree.hasOwnProperty(d.target))
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

    // let publishers_dict={}
    // const publishers=

    let scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12])

    let color = d3.scaleSequential()
        .domain([1995,2020])
        .interpolator(d3.interpolateViridis)


    // const scale_link_stroke_width = d3.scaleLinear()
    //     .domain(d3.extent(data.links, d=> d.value))
    //     .range([1,5])


    //const color = d3.scaleOrdinal(d3.schemeCategory10);
    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        //.style("stroke-width", d=> scale_link_stroke_width(d.value));

    const treatPublishersClass =(Publisher)=>{
       let temp=Publisher.toString().split(' ').join('');
        temp=temp.split(".").join('');
        temp=temp.split(",").join('');
        temp=temp.split("/").join('');
        return "gr"+temp
     }

    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){
            return treatPublishersClass(d.Publisher)
            })
        .on("mouseenter",function (d,data){
            d3.selectAll("#Paper_Title").text(data.Title)
            //all elements inactive
            node_elements.classed("inactive",true)
            const selected_class=d3.select(this)
                .attr("class").split(" ")[0];
            console.log(selected_class)
            d3.selectAll("."+selected_class)
                .classed("inactive",false)

        })
        .on("mouseleave", (d,data)=>{
            d3.select("Paper_Title").text("")
            d3.selectAll(".inactive").classed("inactive",false)
        })
    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            if(node_degree[d.id]!==undefined){
                return scale_radius(node_degree[d.id])
            }
            else {
                return scale_radius(0)
            }

        })
        .attr("fill", function (d,i){
            return color(d.Year)
        })

    // node_elements.append("text")
    //     .attr("class","label")
    //     .attr("text-anchor","middle")
    //     .text(d=>d.name)

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d,i) {
                return scale_radius(node_degree[d.id])*1.2}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(function (d){
                return d.id
            })
            // .distance(d=>d.value)
            // .strength(d=>d.value*.1)
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
        .attr('transform', (d)=>`translate(${d.x},${d.y})`)
        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})

        }

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }




}
