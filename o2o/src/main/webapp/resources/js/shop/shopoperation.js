/**
 * 
 */
$(function(){
	var shopId = getQueryString("shopId");
	//如果shopId是true就是用来更新店铺信息，如果为false即是注册店铺
	
	var isEdit = shopId?true:false;
	console.log(isEdit);
	//由于在pom.xml中定义jetty访问的路径，所以这里的url不用加o2o项目名
	var initUrl = '/shopadmin/getshopinitinfo';
	var registerShopUrl = '/shopadmin/registershop';
	var shopInfoUrl = '/shopadmin/getshopbyid?shopId=' + shopId;
	var editShopUrl ='/shopadmin/modifyshop';
	/*
	 * 去后台调取区域信息以及店铺类别信息，并加载到前端的店铺类别和区域类别控件当中
	 */
	//alert(initUrl);
	if(!isEdit){
		getShopInitInfo();
	}else{
		getShopInfo(shopId);
	}
	//店铺编辑获取的信息
	function getShopInfo(shopId){
		$.getJSON(shopInfoUrl,function(data){
			if(data.success){
				var shop = data.shop;
				$('#shop-name').val(shop.shopName);
				$('#shop-addr').val(shop.shopAddr);
				$('#shop-phone').val(shop.phone);
				$('#shop-desc').val(shop.shopDesc);
				var shopCategory = '<option data-id="' + shop.shopCategory.shopCategoryId + '">'
				+ shop.shopCategory.shopCategoryName + '</option>';
				var tempAreaHtml = '';
				data.areaList.map(function(item,index){
					tempAreaHtml += '<option data-id="' + item.areaId + '">'
					+ item.areaName + '</option>';
				});
				$('#shop-category').html(shopCategory);
				//设置属性，不可修改
				$('#shop-category').attr('disabled','disabled');
				$('#area').html(tempAreaHtml);
				//设置默认选择店铺现在的区域信息
				$("#area option[data-id='" + shop.area.areaId + "']").attr('selected',"selected");
			}
			
		});
	}
	function getShopInitInfo(){
		$.getJSON(initUrl,function(data){
			if(data.success){
			//	console.log('成功调用getShopInitInfo');
				var tempHtml = '';
				var tempAreaHtml = '';
				data.shopCategoryList.map(function(item,index){
					tempHtml += '<option data-id="' + item.shopCategoryId + '">'
					+ item.shopCategoryName + '</option>';
				});
				data.areaList.map(function(item,index){
					tempAreaHtml += '<option data-id="' + item.areaId + '">'
					+ item.areaName + '</option>';
				});
				$('#shop-category').html(tempHtml);
				$('#area').html(tempAreaHtml);
			}
			else{
				console.log('调用失败');
			}
		});
	}	
		$('#submit').click(function(){
			var shop = {};
			if(isEdit){
				shop.shopId = shopId;
			}
			shop.shopName = $('#shop-name').val();
			shop.shopAddr = $('#shop-addr').val();
			shop.phone = $('#shop-phone').val();
			shop.shopDesc = $('#shop-desc').val();
			shop.shopCategory = {
					shopCategoryId:$('#shop-category').find('option').not(function(){
						return !this.selected;
					}).data('id')
			};
			shop.area = {
					areaId:$('#area').find('option').not(function(){
						return !this.selected;
					}).data('id')
			};
			//不太清楚为什么使用下面这条语句就无法添加到formData对象，而且使用Ajax发送不成功？
			var shopImg = $('#shop-img')[0].files[0];
			//var shopImg = document.getElementById("shop-img").files;
			var formData = new FormData();
			formData.append('shopImg',shopImg);
			formData.append('shopStr',JSON.stringify(shop));
			//检查验证码并将其传入后台进行验证
			var verifyCodeActual = $('#j_captcha').val();
			console.log(verifyCodeActual);
			if(!verifyCodeActual){
				$.toast("请输入验证码!");
				return;
			}
			formData.append('verifyCodeActual',verifyCodeActual);
			$.ajax({
				//通过isEdit判断是注册店铺还是修改店铺
				url : (isEdit?editShopUrl:registerShopUrl),
				type:'POST',
				data : formData,
				contentType : false,
				processData : false,
				cache:false,
				error: function (jqXHR, textStatus, errorThrown) {
		            //弹出jqXHR对象的信息
		            console.log(jqXHR.responseText);
		            console.log(jqXHR.status);
		            console.log(jqXHR.readyState);
		            console.log(jqXHR.statusText);
		            //弹出其他两个参数的信息
		            console.log(textStatus);
		            console.log(errorThrown);
		        },
				success: function(data){
					if(data.success){
						$.toast('提交成功!');
					}else{
						$.toast('提交失败!' + data.errMsg);
					}
				}
			});
		});
})