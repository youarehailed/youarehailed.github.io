var is_paused = 1;
var game_data;
timer = null;

function start(){
	$(document).off('keydown').on('keydown', function(e){keypress_handler(e)});
	$('input[name="radio"]').off('click').css("cursor","default")
	player = 0
	ti = 0
	load_state()
}

function select_random_trial(){
	player = Math.floor((Math.random() * game_data.length));
	ti = Math.floor((Math.random() * game_data[player].length));
	load_state()
}

function keypress_handler(e){
	if(e.keyCode == 32){
		btn_press_play()
	}
	if(e.keyCode == 37){
		btn_press_backward()
	}
	if(e.keyCode == 39){
		btn_press_forward()
	}
}

function load_data(){
	var filename = "https://basvanopheusden.github.io/data/eval.json"
	$.getJSON(filename, function(response) {
		game_data = response
		start()
	});
}

function process_name(n){
	if(n >= 1000){
		return "Computer " + (n-999).toString()
	}
	else {
		return "Participant " + (n+1).toString()
	}
}

function show_trial_info(){
	var color = game_data[player][ti][0]
	$('.headertext').text(process_name(game_data[player][ti][4])+ ", trial " + (ti+1).toString() + ", " + ((color==1)?"White":"Black") + " to move")
}

function btn_press_play() {
    if(!is_paused){
      is_paused = 1;
	  $("#button_play i").attr("class", "fa fa-play");
	  $("#button_play").css("background-color", "#dddddd");
	  clearTimeout(timer);
	}
	else {
	  is_paused = 0;
	  $("#button_play i").attr("class", "fa fa-pause");
	  timer = setTimeout(btn_press_forward,2000);
	  $("#button_play").css("background-color", "#ffa500");
	}
}

function load_state(){
	var data = game_data[player][ti]
	var color = data[0]
	var bp = data[1]
	var wp = data[2]
	var choice = data[3]
	board = new Board()
	board.create_tiles()
	for(var i=0; i<M*N; i++){
		if(bp[i]=='1'){
			board.add_piece(i, 0);
		}
		if(wp[i]=='1'){
			board.add_piece(i, 1);
		}
	}
	$('input[name="radio"]').prop('checked', false)
	clearTimeout(timer);
	timer = setTimeout(function(){
		console.log(choice)
		$('input[name="radio"][value="' + choice.toString() + '"]').prop('checked', true)
		if(!is_paused){
			clearTimeout(timer);
			timer = setTimeout(btn_press_forward,1350);
		}
	},650)
	show_trial_info()
}

function btn_press_forward() {
	if(ti < game_data[player].length-1 || player < game_data.length-1){
		ti++
		if(ti == game_data[player].length){
			player++
			ti = 0	
		}
	}
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	load_state()
}

function btn_press_backward(){
	if(ti > 0 || player > 0){
		if(ti == 0){
			player--
			ti = game_data[player].length
		}
		ti--
	}
	clearTimeout(timer);
	if(!is_paused){
		timer = setTimeout(btn_press_forward,2000);
	}
	load_state()
}


function load_game_data_old(){
	var filename = "https://basvanopheusden.github.io/data/eval.csv"
	$.get(filename, function(response) {
		game_data = response.split("\n");
		make_json();
	});
}

function make_json(){
	player = 0;
	x=[]
	y=[]
	for(var i=0;i<game_data.length-1;i++){
		var p = parseInt(game_data[i].split(",")[0])
		var wp = game_data[i].split(",")[3]
		var bp = game_data[i].split(",")[2]
		var color = parseInt(game_data[i].split(",")[1])
		var choice = parseInt(game_data[i].split(",")[4])
		if(p > player && p < 1000){
			player++
			x.push(y)
			y=[]
		}
		y.push([color,bp,wp,choice])
	}
	x.push(y)
	console.log(x.length)
    var blob = new Blob([JSON.stringify(x)], {type: 'text/json'});
	var elem = window.document.createElement('a');
	elem.href = window.URL.createObjectURL(blob);
	elem.download = "eval.json";        
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}