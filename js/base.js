;(function (){
	'use strict';
	/*注册*/
	
	var $form_add_task = $('.add-task')
	 , $window = $(window)
	 , $body = $('body')
	 , $delete_task
	 , $detail_task
	 , $task_detail = $('.task-detail')
	 , $task_detail_mask = $('.task_detail_mask')
	 , task_list = []
	 , current_index
	 , $update_form
	 , $task_detail_content
	 , $task_detail_content_input
	 , $checkbox_complete
	 , $msg = $('.msg')
	 , $msg_content = $msg.find('.msg_content')
	 , $msg_confirm = $msg.find('.confirmed')
	 , $alerter = $('.alerter')
	 ; 
	 
	  init();
	  
	  /*监听添加任务*/
	 $form_add_task.on('submit', on_add_task_form_submit)
	 $task_detail_mask.on('click', hide_task_detail)
	 
	 function listen_msg_event() {
	 	$msg_confirm.on('click', function() {
	 		hide_notify();
	 	})
	 }
	 
	 
	 //alert窗口
	 function pop(arg){
	 	if(!arg){
	 		console.error('pop is wrong');
	 	}
	 	var conf = {}
	 			, $box
	 			, $mask
	 			, $title
	 			, $content
	 			, $confirm
	 			, $cancel
	 			, dfd
	 			, timer
	 			, confirmed
	 			;
	 	
	 	dfd = $.Deferred();//这是啥
	 	 
	 	if(typeof arg == 'string'){
	 		conf.title = arg;
	 	}else{
	 		conf = $.extend(conf,arg);
	 	}
	 		
	 	
	 	$box = $('<div> '+
	 			'<div class="pop-title">'+ conf.title +'</div>' +
	 			'<div class="pop-content">'+
	 				'<div><button class="primary confirm">确定</button>' +
	 				'<button class="cancel">取消</button>' +
	 				'</div>'+
	 			'</div>' +
	 			'</div>')
	 	 		.css({
	 	 			position:'fixed',
	 	 			width:450,
	 	 			height:150,
	 	 			color:'#444',
	 	 			background:'#fff',
	 	 			'border-radius':3,
	 	 			'box-shadow':'0 1px 2px rgba(0,0,0,0.5)'
	 	 		})
	 	
	 	$title = $box.find('.pop-title').css({
	 		padding:'10px 10px',
	 		'font-weight':900,
	 		'font-size':20,
	 		'text-align': 'center'
	 	})
	 	
	 	$content = $box.find('.pop-content').css({
	 		padding:'10px 10px',
	 		'text-align': 'center'
	 		
	 	})
	 	
	 	$confirm = $content.find('button.confirm').css({
	 		'margin': 5
	 	});
	 	$cancel = $content.find('button.cancel');
	 	
	 	$mask = $('<div>' + 
	 			'</div>')
	 			.css({
	 				position:'fixed',
	 				top:0,
	 				bottom:0,
	 				left:0,
	 				right:0,
	 				opacity:0.4,
	 				background:'#000'
	 			})
	 	
	 	timer = setInterval(function(){
	 		if(confirmed !== undefined){
	 			dfd.resolve(confirmed);
	 			clearInterval(timer);
	 			dismiss_pop();
	 		}
	 	}, 50);
	 	
	 	$confirm.on('click',function() {
	 		confirmed = true;
	 	})
	 	
	 	function on_cancel(){
	 		confirmed = false
	 	}
	 	
	 	$cancel.on('click', on_cancel);
	 	
	 	$mask.on('click', on_cancel);
	 	
	 	function dismiss_pop(){
	 		$mask.remove();
	 		$box.remove();
	 	}
	 	
		 function adjust_box_position(){
		 	var window_width = $window.width()
		 	  , window_height = $window.height()
		 	  , box_width = $box.width()
		 	  , box_height = $box.height()
		 	  , move_x
		      , move_y
		 	  ;
		 	  
		 	  move_x = (window_width - box_width)/2;
		 	  move_y = (window_height - box_height)/2 -80;
		 	  $box.css({
		 	  	left: move_x,
		 	  	top: move_y
		 	  })
		 }
	 	
	 	$window.on('resize', function(){
	 		adjust_box_position();
	 	})

	 	$mask.appendTo($body);
	 	$box.appendTo($body);
	 	$window.resize();
	 	return dfd.promise();
	 }
	 
	 
	 
	 
	 function on_add_task_form_submit(e){
	 	var new_task = {}
	 	//禁用默认行为
	 	e.preventDefault();
	 	//获取新task的值
	 	new_task.content = $(this).find('input[name=content]').val();
	 	//如果新task为空，则直接返回
	 	if(!new_task.content) return;
//		存入新task
		if(add_task(new_task)){
//			render_task_list();
			$(this).find('input[name=content]').val(null);
		}
	 }
	 
	 /*监听删除任务*/
	 function listen_task_delete(){
		 	$delete_task.on('click', function (){
		 	var $this = $(this);
		 	var $item = $this.parent().parent();
		 	var index = $item.data('index');
		    pop('确定删除？')
		 	.then(function(r){
		 		r ? delete_task(index) : null;
		 	})
//		 	console.log(tmp);
//		 	console.log(1);
	//	 	console.log('$item.data(index)', $item.data('index'));
		 })
	 }
	
	function listen_task_detail() {
		var index;
		$('.task-item').on('dblclick', function(){
			index = $(this).data('index');
			show_task_detail(index);
		})
		$detail_task.on('click', function(){
			var $this = $(this);
			var $item = $this.parent().parent();
			var index = $item.data('index');
//			console.log(index);
			show_task_detail(index);
		})
	}
	
	function listen_checkbox_complete(){
		$checkbox_complete.on('click', function() {
			console.log($(this).is(':checked'));
			var index = $(this).parent().parent().data('index');
			var item = get(index);
			if(item.complete){
				update_task(index, {complete: false});
			}else{
				update_task(index, {complete: true});
			}
		})
	}
	
	function get(index) {
		return store.get('task_list')[index];
	}
	
	function show_task_detail(index) {
		//生成详情模板
		render_task_detail(index);
		current_index = index;
		//显示模板
		$task_detail.show();
		$task_detail_mask.show();
	}
	
	//更新task
	function update_task(index, data){
		if(!index || !task_list[index]) return;
		
		task_list[index] = $.extend({}, task_list[index], data);
//		task_list[index] = data;
		refresh_task_list();
		console.log('task-list',task_list[index]);
	}
	
	//隐藏task详情
	function hide_task_detail(){
		$task_detail.hide();
		$task_detail_mask.hide();
	}
	
	/*渲染指定task详细信息*/
	function render_task_detail(index){
		if(index === undefined || !task_list[index]) return;
		
		var item = task_list[index];
		
//		console.log(item);
		var tpl = '<form class="">' +
				   '<div class="content">' +
				   item.content +
				   '</div>' +
				   
				'<div class="input-item">' +
					'<input style="display:none" type="text" name="content" value="'+ 
					(item.content || '')+'" />' +
				'</div>' +
				   '<div>' +
				   '<div class="desc input-item">' +
	 				'<textarea name="desc" value="">'+ (item.desc || '') +
	 				'</textarea>' +
					'</div>' +
				    '</div>' +
				    '<div class="remind input-item">' +
				    '<label class="remind-time">提醒时间</label>' +
					'<input class="datetime" name="remind_date" type="text" value="' + 
					(item.remind_date || '') +'" />' +
				    '</div>'+
				    '<div class="input-item"><button type="submit">更新</button></div>'+
			        '</form>';
 		//清空模板      
		$task_detail.html('');
		$task_detail.html(tpl);
		$('.datetime').datetimepicker();
		
		//选中form元素，监听submit事件
		$update_form = $task_detail.find('form');
		//选中task内容元素
		$task_detail_content = $update_form.find('.content');
		$task_detail_content_input = $update_form.find('[name=content]');
		
		//双击显示input
		$task_detail_content.on('dblclick', function() {
			$task_detail_content_input.show();
			$task_detail_content.hide();
		})
		
//		console.log('updata',$update_form);
		$update_form.on('submit', function(e){
			/*禁止默认行为*/
			e.preventDefault();
			var data = {};
			//获取表单中各个值
			data.content = $(this).find('[name=content]').val();
			data.desc = $(this).find('[name=desc]').val();
			data.remind_date = $(this).find('[name=remind_date]').val();
//			console.log(data.content);
//			console.log(data.desc);
//			console.log(data.remind_date);
			update_task(index, data);
			hide_task_detail();
		})
	}
	
	 /*添加任务*/
	 function add_task(new_task) {
	 	task_list.push(new_task);
	 	//更新localstorage
//	 	store.set('task_list', task_list);
		refresh_task_list();
	 	return true;
//	 	console.log('task_list', task_list);
	 }
	 
	 //刷新localstorage数据并渲染模板
	 function refresh_task_list() {
	 	store.set('task_list', task_list);
	 	render_task_list();
	 }
	 
	 /*删除任务*/
	 function delete_task(index){
//	 	console.log(index);
	 	if(index == undefined || !task_list[index]) return;
	 	
	 	delete task_list[index];
//	 	console.log('task_list', task_list);
	 	//更新localstorage
	 	refresh_task_list();
	 }
	 
	 /*初始化？*/
	 function init() {
//	 	store.clear();
	 	task_list = store.get('task_list')||[];
	 	store.set('task_list', task_list);
	 	listen_msg_event();
	 	if(task_list.length){
	 		render_task_list();
	 	}
	 	task_remind_check();
	 }
	 
	 
	 function task_remind_check() {
//	 	show_notify('lallal');
	 	var current_timestamp;
		var itl = setInterval(function () {
			for(var i = 0;i<task_list.length;i++){
		 		var item = get(i),task_timestamp;
		 		if(!item || !item.remind_date || item.informed) 
		 			continue;
		 		current_timestamp = (new Date()).getTime();
		 		task_timestamp = (new Date(item.remind_date)).getTime();
		 		if(current_timestamp - task_timestamp >=1){
		 			update_task(i, {informed:true});
		 			show_notify(item.content);
		 		}
	 		}
		},500);
	 }
	 
	 //提醒
	 function show_notify(msg){
	 	if(!msg) return;
	 	$msg_content.html(msg);
	 	$alerter.get(0).play();
	 	$msg.show();
	 }
	 
	 function hide_notify() {
	 	$msg.hide();	
	 }
	 
	 /*遍历任务列表*/
	 function render_task_list() {
	 	var $task_list = $('.task-list');
	 	$task_list.html('');
	 	var complete_items = [];
	 	for(var i = 0;i < task_list.length;i++){
	 		var item = task_list[i];
	 		if(item && item.complete){
	 			complete_items[i] = item;
	 			//为什么用push有问题？
	 		}else{
	 			var $task = render_task_item(item, i);
	 		}
//	 		console.log($task);
	 		$task_list.prepend($task);
	 	}
	 	
	 	for(var j = 0;j < complete_items.length;j++){
	 		$task = render_task_item(complete_items[j], j);
	 		if(!$task) continue;
	 		$task.addClass('completed');
	 		$task_list.append($task);
	 	}
	 	
	 	
	 	$delete_task = $('.action.delete');
	 	$detail_task = $('.action.detail');
	 	$checkbox_complete = $('.task-list .complete')
	 	
	 	listen_task_delete();
	 	listen_task_detail();
	 	listen_checkbox_complete();
//	 	console.log("delete_task",$delete_task);
//	 		console.log($task_list);
	 }
	 
	 /*渲染任务列表*/
	 function render_task_item(data, index) {
	 	if(!data || !index) return;
	 		 var list_item_tpl = 
	 			'<div class="task-item" data-index="' + index + '">' +
				'<span><input class="complete"'+ (data.complete ? 'checked' : '') + ' type="checkbox"></span>' +
				'<span class="task-content">' + 
				data.content +
				'</span>' + 
				'<span class="fr">' +
				'<span class="action delete"> 删除</span>' +
				'<span class="action detail"> 详细</span>' +
				'</span>' +
			    '</div>';
	 	return $(list_item_tpl);
	 }
})();
