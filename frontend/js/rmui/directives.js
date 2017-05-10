'use strict';

console.log("RMUI: Loading directives.js");
angular.module('uninova.rm.2')
.directive('applicationMenuRm', function(applicationMenuTemplateBuilder) {
	return {
		restrict: 'E',
		replace: true,
		template: applicationMenuTemplateBuilder('/#/rmui', 'mdi-plus-network', 'RM')
	}
})

.directive('rmuiLeftMenu', function(){
	return {
		restrict: 'E',
    	templateUrl: '/rmui/views/partials/leftmenu'
	}
})

.directive('rmuiLeftMenuitem', function(){
	return {
	    restrict: 'E',
	    scope: {
	      icon: '@',
	      href: '@',
	      label: '@'
	    },
	    templateUrl: '/rmui/views/partials/leftmenuitem'
  };
})

.directive('confirmationDialog', function(){
	return {
		restrict: 'EA',
		replace: false,
		transclude: true,
		scope: {
			confirmationId: '@',
			confirmationTitle: '=confirmationHeader',
			confirmationBody: '=confirmationBody',
			successCallback: '&ngClickSuccessCallback'
		},
		link: function(scope, element, attrs) {
			scope.hideConfirmation = function() {
				scope.confirmationContent = null;
			}
		},
		templateUrl: '/rmui/views/partials/confirmation_tpl.html'
	}
})

// directive que vai transformar o dom de workhistory
//precisamos de esperar pela resolucao da promise de d3 service
//usando o .then method
.directive("workHistory",['d3Service', function(d3Service) {
            return {
                restrict: 'E',
                link: function link(scope, el, attr) {
		 d3Service.d3().then(function(d3) {
                    var rectW = 60,
                        rectH = 30;
                    var div = d3.select("body")
                        .append("div") // declare the tooltip div
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    var margin = {
                            top: 20,
                            right: 120,
                            bottom: 20,
                            left: 120
                        },
                        width = 960 - margin.right - margin.left,
                        height = 800 - margin.top - margin.bottom;
                    var i = 0,
                        duration = 750,
                        root, select2_data;
                    var diameter = 960;
                    var tree = d3.layout.tree()
                        .size([height, width]);

                    var diagonal = d3.svg.diagonal()
                        .projection(function(d) {
                            return [d.y + 55, d.x + 15];
                        });

                    var svg = d3.select(el[0]).append("svg")
                        .attr("width", width + margin.right + margin.left)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    //recursively collapse children
                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }



                    // Toggle children on click.
                    function click(d) {
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        update(d);
                    }

                    function openPaths(paths) {
                        for (var i = 0; i < paths.length; i++) {
                            if (paths[i].id !== "1") { //i.e. not root
                                paths[i].class = 'found';
                                if (paths[i]._children) { //if children are hidden: open them, otherwise: don't do anything
                                    paths[i].children = paths[i]._children;
                                    paths[i]._children = null;
                                }
                                update(paths[i]);
                            }
                        }
                    }

                    console.log(scope.company.name);
                    //root = values;
                    root = scope.company
                    //values is the flare.json
                    select2_data = extract_select2_data(values, [], 0)[1]; //I know, not the prettiest...
                    root.x0 = height / 2;
                    root.y0 = 0;
                    root.children.forEach(collapse);
                    update(root);
                    //init search box
                        d3.select(self.frameElement).style("height", "800px");



                    function update(source) {
                        // Compute the new tree layout.
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes);

                        // Normalize for fixed-depth.
                        nodes.forEach(function(d) {
                            //alert("depth: " + d.depth);
                            if (d.type == "hub") d.y = d.depth * 100;
                            // properties level
                            if (d.type == "prop") d.y = 300
                            if (d.type == "rec") d.y = d.depth * 100;
                            //d.y = d.depth * 180;

                        });

                        // Update the nodesÃ¢â‚¬Â¦
                        var node = svg.selectAll("g.node")
                            .data(nodes, function(d) {
                                return d.id || (d.id = ++i);
                            });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) {
                                return "translate(" + source.y0 + "," + source.x0 + ")";
                            })
                            .on("click", click);

                        nodeEnter.append("rect")
                            //.attr("r", 1e-6)
                            .attr("width", rectW)
                            .attr("height", rectH)
                            .attr("stroke", "#80deea")
                            .attr("stroke-width", 2)
                            .style("fill", function(d) {
                                if (d.type == "comp") return "white";
                                if (d.type == "hub") return "#80deea";
                                if (d.type == "rec") return "#26c6da";
                                if (d.type == "prop") return "#F7D358"
                                //return d._children ? "lightsteelblue" : "#fff";

                            });

                        nodeEnter.append("text")
                            .attr("x", rectW / 2)
                            .attr("y", rectH / 2)
                            .attr("dy", ".35em")
                            .attr("text-anchor", "middle")


                            //.attr("x", function (d) { return d.children || d._children ? -10 : 10; })
                            //.attr("dy", ".35em")
                            //.attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
                            .text(function(d) {
                                return d.name;
                            })
                            .style("fill-opacity", 1e-6);

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function(d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            });

                        nodeUpdate.select("rect")
                            .attr("r", 4.5)
                            .style("fill", function(d) {
                                /*if (d.class === "found") {
                                    return "#ff4136"; //red
                                }
                                else if (d._children) {
                                    return "lightsteelblue";
                                }
                                else {
                                    return "#fff";
                                }*/
                                if (d.type == "comp") return "white";
                                if (d.type == "hub") return "white";
                                if (d.type == "rec") return "#26c6da";
                                if (d.type == "prop") return "#F7D358";
                            })
                            .style("stroke", function(d) {
                                if (d.class === "found") {
                                    return "#ffbf00"; //red
                                }
                            });

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);


                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("width", rectW + 20)
                            .attr("height", rectH + 20)
                            .attr("transform", function(d) {
                                return "translate(" + source.y + "," + source.x + ")";
                            })
                            .remove();

                        nodeExit.select("rect")
                            .attr("r", 1e-6);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the linksÃ¢â‚¬Â¦
                        var link = svg.selectAll("path.link")
                            .data(links, function(d) {
                                return d.target.id;
                            });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("x", rectW / 2)
                            .attr("y", rectH / 2)
                            .attr("d", function(d) {
                                //alert("CENAS:" + source.x0)
                                var o = {
                                    x: source.x0,
                                    y: source.y0,
                                    height: source.height
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal)
                            .style("stroke", function(d) {
                                if (d.target.class === "found") {
                                    return "#ffbf00";
                                }
                            });

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function(d) {
                                var o = {
                                    x: source.x,
                                    y: source.y
                                };
                                return diagonal({
                                    source: o,
                                    target: o
                                });
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function(d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });
                    }

                    function searchTree(obj, search, path) {
                        if (obj.name === search) { //if search is found return, add the object to the path and return it
                            path.push(obj);
                            return path;
                        } else if (obj.children || obj._children) { //if children are collapsed d3 object will have them instantiated as _children
                            var children = (obj.children) ? obj.children : obj._children;
                            for (var i = 0; i < children.length; i++) {
                                path.push(obj); // we assume this path is the right one
                                var found = searchTree(children[i], search, path);
                                if (found) { // we were right, this should return the bubbled-up path from the first if statement
                                    return found;
                                } else { //we were wrong, remove this parent from the path and continue iterating
                                    path.pop();
                                }
                            }
                        } else { //not the right object, return false so it will continue to iterate in the loop
                            return false;
                        }
                    }
                    scope.$watch(function() {
                        return update(root)
                    }, function(newValue, oldValue) {
                        if (newValue)
                            console.log("I see a data change!");
                    }, true);

                    function extract_select2_data(node, leaves, index) {
                        if (node.children) {
                            for (var i = 0; i < node.children.length; i++) {
                                index = extract_select2_data(node.children[i], leaves, index)[0];
                            }
                        } else {
                            leaves.push({
                                id: ++index,
                                text: node.name
                            });
                        }
                        return [index, leaves];
            }
		 			})
                }

            }
		}]
        );


        var values = {
            "name": "flare",
            "children": [{
                    "name": "analytics",
                    "children": [{
                            "name": "cluster",
                            "children": [{
                                    "name": "AgglomerativeCluster",
                                    "size": 100
                                },
                                {
                                    "name": "CommunityStructure",
                                    "size": 3812
                                },
                                {
                                    "name": "HierarchicalCluster",
                                    "size": 6714
                                },
                                {
                                    "name": "MergeEdge",
                                    "size": 743
                                }
                            ]
                        },
                        {
                            "name": "graph",
                            "children": [{
                                    "name": "BetweennessCentrality",
                                    "size": 3534
                                },
                                {
                                    "name": "LinkDistance",
                                    "size": 5731
                                },
                                {
                                    "name": "MaxFlowMinCut",
                                    "size": 7840
                                },
                                {
                                    "name": "ShortestPaths",
                                    "size": 5914
                                },
                                {
                                    "name": "SpanningTree",
                                    "size": 3416
                                }
                            ]
                        },
                        {
                            "name": "optimization",
                            "children": [{
                                "name": "AspectRatioBanker",
                                "size": 7074
                            }]
                        }
                    ]
                },
                {
                    "name": "animate",
                    "children": [{
                            "name": "Easing",
                            "size": 17010
                        },
                        {
                            "name": "FunctionSequence",
                            "size": 5842
                        },
                        {
                            "name": "interpolate",
                            "children": [{
                                    "name": "ArrayInterpolator",
                                    "size": 1983
                                },
                                {
                                    "name": "ColorInterpolator",
                                    "size": 2047
                                },
                                {
                                    "name": "DateInterpolator",
                                    "size": 1375
                                },
                                {
                                    "name": "Interpolator",
                                    "size": 8746
                                },
                                {
                                    "name": "MatrixInterpolator",
                                    "size": 2202
                                },
                                {
                                    "name": "NumberInterpolator",
                                    "size": 1382
                                },
                                {
                                    "name": "ObjectInterpolator",
                                    "size": 1629
                                },
                                {
                                    "name": "PointInterpolator",
                                    "size": 1675
                                },
                                {
                                    "name": "RectangleInterpolator",
                                    "size": 2042
                                }
                            ]
                        },
                        {
                            "name": "ISchedulable",
                            "size": 1041
                        },
                        {
                            "name": "Parallel",
                            "size": 5176
                        },
                        {
                            "name": "Pause",
                            "size": 449
                        },
                        {
                            "name": "Scheduler",
                            "size": 5593
                        },
                        {
                            "name": "Sequence",
                            "size": 5534
                        },
                        {
                            "name": "Transition",
                            "size": 9201
                        },
                        {
                            "name": "Transitioner",
                            "size": 19975
                        },
                        {
                            "name": "TransitionEvent",
                            "size": 1116
                        },
                        {
                            "name": "Tween",
                            "size": 6006
                        }
                    ]
                },
                {
                    "name": "data",
                    "children": [{
                            "name": "converters",
                            "children": [{
                                    "name": "Converters",
                                    "size": 721
                                },
                                {
                                    "name": "DelimitedTextConverter",
                                    "size": 4294
                                },
                                {
                                    "name": "GraphMLConverter",
                                    "size": 9800
                                },
                                {
                                    "name": "IDataConverter",
                                    "size": 1314
                                },
                                {
                                    "name": "JSONConverter",
                                    "size": 2220
                                }
                            ]
                        },
                        {
                            "name": "DataField",
                            "size": 1759
                        },
                        {
                            "name": "DataSchema",
                            "size": 2165
                        },
                        {
                            "name": "DataSet",
                            "size": 586
                        },
                        {
                            "name": "DataSource",
                            "size": 3331
                        },
                        {
                            "name": "DataTable",
                            "size": 772
                        },
                        {
                            "name": "DataUtil",
                            "size": 3322
                        }
                    ]
                },
                {
                    "name": "display",
                    "children": [{
                            "name": "DirtySprite",
                            "size": 8833
                        },
                        {
                            "name": "LineSprite",
                            "size": 1732
                        },
                        {
                            "name": "RectSprite",
                            "size": 3623
                        },
                        {
                            "name": "TextSprite",
                            "size": 10066
                        }
                    ]
                },
                {
                    "name": "flex",
                    "children": [{
                        "name": "FlareVis",
                        "size": 4116
                    }]
                },
                {
                    "name": "physics",
                    "children": [{
                            "name": "DragForce",
                            "size": 1082
                        },
                        {
                            "name": "GravityForce",
                            "size": 1336
                        },
                        {
                            "name": "IForce",
                            "size": 319
                        },
                        {
                            "name": "NBodyForce",
                            "size": 10498
                        },
                        {
                            "name": "Particle",
                            "size": 2822
                        },
                        {
                            "name": "Simulation",
                            "size": 9983
                        },
                        {
                            "name": "Spring",
                            "size": 2213
                        },
                        {
                            "name": "SpringForce",
                            "size": 1681
                        }
                    ]
                },
                {
                    "name": "query",
                    "children": [{
                            "name": "AggregateExpression",
                            "size": 1616
                        },
                        {
                            "name": "And",
                            "size": 1027
                        },
                        {
                            "name": "Arithmetic",
                            "size": 3891
                        },
                        {
                            "name": "Average",
                            "size": 891
                        },
                        {
                            "name": "BinaryExpression",
                            "size": 2893
                        },
                        {
                            "name": "Comparison",
                            "size": 5103
                        },
                        {
                            "name": "CompositeExpression",
                            "size": 3677
                        },
                        {
                            "name": "Count",
                            "size": 781
                        },
                        {
                            "name": "DateUtil",
                            "size": 4141
                        },
                        {
                            "name": "Distinct",
                            "size": 933
                        },
                        {
                            "name": "Expression",
                            "size": 5130
                        },
                        {
                            "name": "ExpressionIterator",
                            "size": 3617
                        },
                        {
                            "name": "Fn",
                            "size": 3240
                        },
                        {
                            "name": "If",
                            "size": 2732
                        },
                        {
                            "name": "IsA",
                            "size": 2039
                        },
                        {
                            "name": "Literal",
                            "size": 1214
                        },
                        {
                            "name": "Match",
                            "size": 3748
                        },
                        {
                            "name": "Maximum",
                            "size": 843
                        },
                        {
                            "name": "methods",
                            "children": [{
                                    "name": "add",
                                    "size": 593
                                },
                                {
                                    "name": "and",
                                    "size": 330
                                },
                                {
                                    "name": "average",
                                    "size": 287
                                },
                                {
                                    "name": "count",
                                    "size": 277
                                },
                                {
                                    "name": "distinct",
                                    "size": 292
                                },
                                {
                                    "name": "div",
                                    "size": 595
                                },
                                {
                                    "name": "eq",
                                    "size": 594
                                },
                                {
                                    "name": "fn",
                                    "size": 460
                                },
                                {
                                    "name": "gt",
                                    "size": 603
                                },
                                {
                                    "name": "gte",
                                    "size": 625
                                },
                                {
                                    "name": "iff",
                                    "size": 748
                                },
                                {
                                    "name": "isa",
                                    "size": 461
                                },
                                {
                                    "name": "lt",
                                    "size": 597
                                },
                                {
                                    "name": "lte",
                                    "size": 619
                                },
                                {
                                    "name": "max",
                                    "size": 283
                                },
                                {
                                    "name": "min",
                                    "size": 283
                                },
                                {
                                    "name": "mod",
                                    "size": 591
                                },
                                {
                                    "name": "mul",
                                    "size": 603
                                },
                                {
                                    "name": "neq",
                                    "size": 599
                                },
                                {
                                    "name": "not",
                                    "size": 386
                                },
                                {
                                    "name": "or",
                                    "size": 323
                                },
                                {
                                    "name": "orderby",
                                    "size": 307
                                },
                                {
                                    "name": "range",
                                    "size": 772
                                },
                                {
                                    "name": "select",
                                    "size": 296
                                },
                                {
                                    "name": "stddev",
                                    "size": 363
                                },
                                {
                                    "name": "sub",
                                    "size": 600
                                },
                                {
                                    "name": "sum",
                                    "size": 280
                                },
                                {
                                    "name": "update",
                                    "size": 307
                                },
                                {
                                    "name": "variance",
                                    "size": 335
                                },
                                {
                                    "name": "where",
                                    "size": 299
                                },
                                {
                                    "name": "xor",
                                    "size": 354
                                },
                                {
                                    "name": "_",
                                    "size": 264
                                }
                            ]
                        },
                        {
                            "name": "Minimum",
                            "size": 843
                        },
                        {
                            "name": "Not",
                            "size": 1554
                        },
                        {
                            "name": "Or",
                            "size": 970
                        },
                        {
                            "name": "Query",
                            "size": 13896
                        },
                        {
                            "name": "Range",
                            "size": 1594
                        },
                        {
                            "name": "StringUtil",
                            "size": 4130
                        },
                        {
                            "name": "Sum",
                            "size": 791
                        },
                        {
                            "name": "Variable",
                            "size": 1124
                        },
                        {
                            "name": "Variance",
                            "size": 1876
                        },
                        {
                            "name": "Xor",
                            "size": 1101
                        }
                    ]
                },
                {
                    "name": "scale",
                    "children": [{
                            "name": "IScaleMap",
                            "size": 2105
                        },
                        {
                            "name": "LinearScale",
                            "size": 1316
                        },
                        {
                            "name": "LogScale",
                            "size": 3151
                        },
                        {
                            "name": "OrdinalScale",
                            "size": 3770
                        },
                        {
                            "name": "QuantileScale",
                            "size": 2435
                        },
                        {
                            "name": "QuantitativeScale",
                            "size": 4839
                        },
                        {
                            "name": "RootScale",
                            "size": 1756
                        },
                        {
                            "name": "Scale",
                            "size": 4268
                        },
                        {
                            "name": "ScaleType",
                            "size": 1821
                        },
                        {
                            "name": "TimeScale",
                            "size": 5833
                        }
                    ]
                },
                {
                    "name": "util",
                    "children": [{
                            "name": "Arrays",
                            "size": 8258
                        },
                        {
                            "name": "Colors",
                            "size": 10001
                        },
                        {
                            "name": "Dates",
                            "size": 8217
                        },
                        {
                            "name": "Displays",
                            "size": 12555
                        },
                        {
                            "name": "Filter",
                            "size": 2324
                        },
                        {
                            "name": "Geometry",
                            "size": 10993
                        },
                        {
                            "name": "heap",
                            "children": [{
                                    "name": "FibonacciHeap",
                                    "size": 9354
                                },
                                {
                                    "name": "HeapNode",
                                    "size": 1233
                                }
                            ]
                        },
                        {
                            "name": "IEvaluable",
                            "size": 335
                        },
                        {
                            "name": "IPredicate",
                            "size": 383
                        },
                        {
                            "name": "IValueProxy",
                            "size": 874
                        },
                        {
                            "name": "math",
                            "children": [{
                                    "name": "DenseMatrix",
                                    "size": 3165
                                },
                                {
                                    "name": "IMatrix",
                                    "size": 2815
                                },
                                {
                                    "name": "SparseMatrix",
                                    "size": 3366
                                }
                            ]
                        },
                        {
                            "name": "Maths",
                            "size": 17705
                        },
                        {
                            "name": "Orientation",
                            "size": 1486
                        },
                        {
                            "name": "palette",
                            "children": [{
                                    "name": "ColorPalette",
                                    "size": 6367
                                },
                                {
                                    "name": "Palette",
                                    "size": 1229
                                },
                                {
                                    "name": "ShapePalette",
                                    "size": 2059
                                },
                                {
                                    "name": "SizePalette",
                                    "size": 2291
                                }
                            ]
                        },
                        {
                            "name": "Property",
                            "size": 5559
                        },
                        {
                            "name": "Shapes",
                            "size": 19118
                        },
                        {
                            "name": "Sort",
                            "size": 6887
                        },
                        {
                            "name": "Stats",
                            "size": 6557
                        },
                        {
                            "name": "Strings",
                            "size": 22026
                        }
                    ]
                },
                {
                    "name": "vis",
                    "children": [{
                            "name": "axis",
                            "children": [{
                                    "name": "Axes",
                                    "size": 1302
                                },
                                {
                                    "name": "Axis",
                                    "size": 24593
                                },
                                {
                                    "name": "AxisGridLine",
                                    "size": 652
                                },
                                {
                                    "name": "AxisLabel",
                                    "size": 636
                                },
                                {
                                    "name": "CartesianAxes",
                                    "size": 6703
                                }
                            ]
                        },
                        {
                            "name": "controls",
                            "children": [{
                                    "name": "AnchorControl",
                                    "size": 2138
                                },
                                {
                                    "name": "ClickControl",
                                    "size": 3824
                                },
                                {
                                    "name": "Control",
                                    "size": 1353
                                },
                                {
                                    "name": "ControlList",
                                    "size": 4665
                                },
                                {
                                    "name": "DragControl",
                                    "size": 2649
                                },
                                {
                                    "name": "ExpandControl",
                                    "size": 2832
                                },
                                {
                                    "name": "HoverControl",
                                    "size": 4896
                                },
                                {
                                    "name": "IControl",
                                    "size": 763
                                },
                                {
                                    "name": "PanZoomControl",
                                    "size": 5222
                                },
                                {
                                    "name": "SelectionControl",
                                    "size": 7862
                                },
                                {
                                    "name": "TooltipControl",
                                    "size": 8435
                                }
                            ]
                        },
                        {
                            "name": "data",
                            "children": [{
                                    "name": "Data",
                                    "size": 20544
                                },
                                {
                                    "name": "DataList",
                                    "size": 19788
                                },
                                {
                                    "name": "DataSprite",
                                    "size": 10349
                                },
                                {
                                    "name": "EdgeSprite",
                                    "size": 3301
                                },
                                {
                                    "name": "NodeSprite",
                                    "size": 19382
                                },
                                {
                                    "name": "render",
                                    "children": [{
                                            "name": "ArrowType",
                                            "size": 698
                                        },
                                        {
                                            "name": "EdgeRenderer",
                                            "size": 5569
                                        },
                                        {
                                            "name": "IRenderer",
                                            "size": 353
                                        },
                                        {
                                            "name": "ShapeRenderer",
                                            "size": 2247
                                        }
                                    ]
                                },
                                {
                                    "name": "ScaleBinding",
                                    "size": 11275
                                },
                                {
                                    "name": "Tree",
                                    "size": 7147
                                },
                                {
                                    "name": "TreeBuilder",
                                    "size": 9930
                                }
                            ]
                        },
                        {
                            "name": "events",
                            "children": [{
                                    "name": "DataEvent",
                                    "size": 2313
                                },
                                {
                                    "name": "SelectionEvent",
                                    "size": 1880
                                },
                                {
                                    "name": "TooltipEvent",
                                    "size": 1701
                                },
                                {
                                    "name": "VisualizationEvent",
                                    "size": 1117
                                }
                            ]
                        },
                        {
                            "name": "legend",
                            "children": [{
                                    "name": "Legend",
                                    "size": 20859
                                },
                                {
                                    "name": "LegendItem",
                                    "size": 4614
                                },
                                {
                                    "name": "LegendRange",
                                    "size": 10530
                                }
                            ]
                        },
                        {
                            "name": "operator",
                            "children": [{
                                    "name": "distortion",
                                    "children": [{
                                            "name": "BifocalDistortion",
                                            "size": 4461
                                        },
                                        {
                                            "name": "Distortion",
                                            "size": 6314
                                        },
                                        {
                                            "name": "FisheyeDistortion",
                                            "size": 3444
                                        }
                                    ]
                                },
                                {
                                    "name": "encoder",
                                    "children": [{
                                            "name": "ColorEncoder",
                                            "size": 3179
                                        },
                                        {
                                            "name": "Encoder",
                                            "size": 4060
                                        },
                                        {
                                            "name": "PropertyEncoder",
                                            "size": 4138
                                        },
                                        {
                                            "name": "ShapeEncoder",
                                            "size": 1690
                                        },
                                        {
                                            "name": "SizeEncoder",
                                            "size": 1830
                                        }
                                    ]
                                },
                                {
                                    "name": "filter",
                                    "children": [{
                                            "name": "FisheyeTreeFilter",
                                            "size": 5219
                                        },
                                        {
                                            "name": "GraphDistanceFilter",
                                            "size": 3165
                                        },
                                        {
                                            "name": "VisibilityFilter",
                                            "size": 3509
                                        }
                                    ]
                                },
                                {
                                    "name": "IOperator",
                                    "size": 1286
                                },
                                {
                                    "name": "label",
                                    "children": [{
                                            "name": "Labeler",
                                            "size": 9956
                                        },
                                        {
                                            "name": "RadialLabeler",
                                            "size": 3899
                                        },
                                        {
                                            "name": "StackedAreaLabeler",
                                            "size": 3202
                                        }
                                    ]
                                },
                                {
                                    "name": "layout",
                                    "children": [{
                                            "name": "AxisLayout",
                                            "size": 6725
                                        },
                                        {
                                            "name": "BundledEdgeRouter",
                                            "size": 3727
                                        },
                                        {
                                            "name": "CircleLayout",
                                            "size": 9317
                                        },
                                        {
                                            "name": "CirclePackingLayout",
                                            "size": 12003
                                        },
                                        {
                                            "name": "DendrogramLayout",
                                            "size": 4853
                                        },
                                        {
                                            "name": "ForceDirectedLayout",
                                            "size": 8411
                                        },
                                        {
                                            "name": "IcicleTreeLayout",
                                            "size": 4864
                                        },
                                        {
                                            "name": "IndentedTreeLayout",
                                            "size": 3174
                                        },
                                        {
                                            "name": "Layout",
                                            "size": 7881
                                        },
                                        {
                                            "name": "NodeLinkTreeLayout",
                                            "size": 12870
                                        },
                                        {
                                            "name": "PieLayout",
                                            "size": 2728
                                        },
                                        {
                                            "name": "RadialTreeLayout",
                                            "size": 12348
                                        },
                                        {
                                            "name": "RandomLayout",
                                            "size": 870
                                        },
                                        {
                                            "name": "StackedAreaLayout",
                                            "size": 9121
                                        },
                                        {
                                            "name": "TreeMapLayout",
                                            "size": 9191
                                        }
                                    ]
                                },
                                {
                                    "name": "Operator",
                                    "size": 2490
                                },
                                {
                                    "name": "OperatorList",
                                    "size": 5248
                                },
                                {
                                    "name": "OperatorSequence",
                                    "size": 4190
                                },
                                {
                                    "name": "OperatorSwitch",
                                    "size": 2581
                                },
                                {
                                    "name": "SortOperator",
                                    "size": 2023
                                }
                            ]
                        },
                        {
                            "name": "Visualization",
                            "size": 16540
                        }
                    ]
                }]}


