function parse(d) {
	//debugger;
	//console.table(data)
	d['MeanDepDelay'] = +d["MeanDepDelay"];
	d['StdDepDelay'] = +d['StdDepDelay'];
	return d;
}
