attempt = 1;
iterations = 0;
order = []
files = []
svgs = [];
pieces = 0;

function init(){
	loadConfig();
	$('#loadorder').on('click',function(){
		console.log('click')
		loadOrder();
	});
}

function loadConfig(){
	$.ajax({
		url: "item_config.json",
		dataType: 'json',
		success: function(result){
			generateOrderMenu(result);
		}
	});			
}

function generateOrderMenu(config){
	config.items.forEach(function(item,i){
		let name = item.name;
		let sizes = item.sizes;
		$('#order_items').append('<p>'+name+' <select id="item_'+i+'"></select><button id="add_item_'+i+'">Add</button>');
		let id = '#item_'+i;
		sizes.forEach(function(size){
			$(id).append('<option>'+size.size+'</option>');
		});
		$('#add_item_'+i).on('click',function(){
			let size = $('#item_'+i).val();
			addToOrder(item,size);
		});
	});
}

function addToOrder(item,size){
	item.sizes.forEach(function(itemsize){
		if(itemsize.size == size){
			order.push({'name':item.name,'size':size,'pieces':itemsize.pieces});
		}
	});
	displayOrder();
}

function displayOrder(){
	let html = ''
	order.forEach(function(o){
		html += '<p>'+o.name+' - '+o.size+'</p>';
	});
	$('#order_added').html(html);
}

function loadOrder(){
	order.forEach(function(item){
		item.pieces.forEach(function(piece){
			files.push(piece);
		});
	});
	console.log(files);
	loadFiles(files);
}

function loadFiles(files){
	file = files[0];
	console.log(file);
	$.ajax({
		url: 'test_files/sample_files/'+file,
		dataType:'text',
		success: function(result){;
			console.log(result);
			svgs.push(result)
			files.shift()
			if(files.length>0){
				loadFiles(files)
			} else {
				loadFilesComplete()
			}
		}
	});	
}

function stackSVGs(){
	svgs.forEach(function(svg,i){
		$('#tempsvg').html(svg);
		transformy = 500*i
		$('#svg').append('<g id="transform_'+i+'" transform="translate('+transformy+',0)"></g>');
		let newSVG = $('#tempsvg').children()[0].innerHTML;
		$('#transform_'+i).append(newSVG);
		$('#tempsvg').html('');
		pieces++;
	});
	combineSVG = $('#combinesvg').html();
	initProcess(combineSVG);
}

function loadFilesComplete(){
	console.log('all files loaded');
	stackSVGs()
}

function progress(percent){
	$('#percent_progress'+attempt).html(Math.round(percent*100));
}

function renderSvg(svglist, efficiency, placed, total, bestplacements){
	if(svglist!=undefined){
		let output = document.getElementById('output'+attempt);
		output.innerHTML = '';
		svglist.forEach(function(svg){
			output.append(svg);
		});
		recreateResult(bestplacements);
	}
	iterations++
	$('#iteration_progress'+attempt).html(iterations);
	if(iterations==15){
		window.SvgNest.stop();
		window.SvgNest.config(window.SvgNest.config());
		attempt++;
		iterations = 0;
		//startProcess();
	}
}

function initProcess(svg){
	window.SvgNest.parsesvg(svg);
	let oParser = new DOMParser();
	//let oDOM = oParser.parseFromString('<rect x="0" y="0" class="st4" width="510.2" height="283.5"/>', "image/svg+xml");
	let oDOM = oParser.parseFromString('<rect x="0" y="0" class="st4" width="300" height="550"/>', "image/svg+xml");
	let bin = oDOM.documentElement;
	console.log(bin);
	window.SvgNest.setbin(bin);
	console.log('Bin Set');
	startProcess();
}

function startProcess(){
	console.log('starting nest');
	window.SvgNest.start(progress, renderSvg);
}

function recreateResult(placements){
	console.log(placements);
	$('#tempsvg').html('');
	placements.forEach(function(layout,i){
		$('#tempsvg').append('<svg id="outputsvg_'+i+'" xmlns="http://www.w3.org/2000/svg"  width="300px" height="550px" viewport="0 0 300 550"></svg>');
		layout.forEach(function(piece,j){
			let rotation = piece.rotation
			if(rotation==180){
				xmultiply = -1
			} else {
				xmultiply = 1
			}
			let transformx = piece.id*500* xmultiply + piece.x
			let transformy = piece.y
			let svgPiece = d3.select('#transform_'+piece.id).selectAll('*').clone(true);
			let id = 'layout_'+i+'_piece_'+j;

			$('#outputsvg_'+i).append('<g id="layout_'+i+'_piece_'+j+'" transform="translate('+transformx+' '+transformy+') rotate('+rotation+')"></g>');
			svgPiece._groups[0].forEach(function(element){
				$('#'+id).append(element);
			});
		});
		let html = $('#tempsvg').html();
		$('#tempsvg').html(html);
	});
}

init();

