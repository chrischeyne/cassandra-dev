//Microsoft.Glimmer.OneWay
//<AnimationCollection FilePath="{x:Null}" xmlns="clr-namespace:GlimmerLib;assembly=GlimmerLib" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Animation Name="OnMouseHover0" EventType="mouseover" Trigger="#trigger0"><Animation.Targets><Target Name="#main_navigation li ul" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target><Target Name="#subNav0" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="visible" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation><Animation Name="OnMouseOut0" EventType="mouseout" Trigger="#trigger0"><Animation.Targets><Target Name="#subNav0" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation><Animation Name="OnMouseHover1" EventType="mouseover" Trigger="#trigger1"><Animation.Targets><Target Name="#main_navigation li ul" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target><Target Name="#subNav1" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="visible" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation><Animation Name="OnMouseOut1" EventType="mouseout" Trigger="#trigger1"><Animation.Targets><Target Name="#subNav1" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation><Animation Name="OnMouseHover2" EventType="mouseover" Trigger="#trigger2"><Animation.Targets><Target Name="#main_navigation li ul" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target><Target Name="#subNav2" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="visible" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation><Animation Name="OnMouseOut2" EventType="mouseout" Trigger="#trigger2"><Animation.Targets><Target Name="#subNav2" Duration="1000" Easing="linear" Callback="null"><Target.Effects><ModifyCSSEffect CSSName="visibility" DisplayName="Modify CSS Effect" MaxValue="5000" MinValue="-5000" From="0" To="hidden" IsStartValue="False" IsActive="True" IsAnimatable="False" IsExpression="False" FormatString="$({0}).css({1},{2});&#xD;&#xA;" RequiresJQueryPlugin="False" JQueryPluginURI="" /></Target.Effects></Target></Animation.Targets></Animation></AnimationCollection>
jQuery(function($) {
var timer;
function OnMouseHover0(event)
{
     $("#main_navigation li ul").css("visibility","hidden");
     $("#subNav0").css("visibility","visible");
}

function OnMouseOut0(event)
{
     $("#subNav0").css("visibility","hidden");
}

function OnMouseHover1(event)
{
     $("#main_navigation li ul").css("visibility","hidden");
     $("#subNav1").css("visibility","visible");
}

function OnMouseOut1(event)
{
     $("#subNav1").css("visibility","hidden");
}

function OnMouseHover2(event)
{
     $("#main_navigation li ul").css("visibility","hidden");
     $("#subNav2").css("visibility","visible");
}

function OnMouseOut2(event)
{
     $("#subNav2").css("visibility","hidden");
}

$('#trigger0').bind('mouseover', OnMouseHover0);

$('#trigger0').bind('mouseout', OnMouseOut0);

$('#trigger1').bind('mouseover', OnMouseHover1);

$('#trigger1').bind('mouseout', OnMouseOut1);

$('#trigger2').bind('mouseover', OnMouseHover2);

$('#trigger2').bind('mouseout', OnMouseOut2);

});