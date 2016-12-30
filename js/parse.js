function parse(d) {
	d['MeanDepDelay'] = +d["MeanDepDelay"];
	d['StdDepDelay'] = +d['StdDepDelay'];
	return d;
}
