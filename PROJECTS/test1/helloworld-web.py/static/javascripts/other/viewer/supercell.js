//<AnimationCollection FilePath="C:\Users\jbk\DANSE\vimm\web\viewer\lattice16.html.glimmer.js" xmlns="clr-namespace:GlimmerLib;assembly=GlimmerLib" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Animation Name="createSupercell" EventType="click" Trigger="a "><Animation.Targets><Target Name="{x:Null}" Duration="1000" Easing="linear" Callback="null"><Target.Effects><EffectCollection /></Target.Effects></Target></Animation.Targets></Animation></AnimationCollection>

jQuery(function($) {

$('.supercell').popupWindow({
	height:100,
	width:600//,
	//top:50,
	//left:50
	});

$('#enterSupercell').each(function(){
//$('input[type="text"]').each(function(){
	sizeX = $('#enterSupercellX').value;
	sizeY = $('#enterSupercellY').value;
	sizeY = $('#enterSupercellZ').value;
	
//	this.value = $(this).attr('title');
//	$(this).addClass('text-label');
//	$(this).focus(function(){
//		if(this.value == $(this).attr('title')) {
//			this.value = '';
//			$(this).removeClass('text-label');
//		}
//	});

//	$(this).blur(function(){
//		if(this.value == '') {
//			this.value = $(this).attr('title');
//			$(this).addClass('text-label');
//		}
//	});
});

//$('#enterSupercell').bind('click', createSupercell);
//function createSupercell(event){
//}

});
 