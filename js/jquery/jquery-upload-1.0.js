/*
 * 文件上传核心类:
 * --------------------------------------------------------
 * files: 可以是单个文件对象或多个文件对象，对应<input type="file" multiple>
 * uploadUrl: 表示处理文件上传的服务器端处理
 * opts：表示可选项，其中主要包括以下参数：
 * 		params: 表示除上传的文件外的其他参数
 * 		errorCallback： 表示上传出错的时候的回调函数， 参数为错误的消息
 * 		progressCallback: 上传进度过程中的回调函数， 参数为上传进度
 * 		successCallback： 表示上传成功的回调函数吗， 参数为上传成功后后天返回的json数据
 * 		urlParams: 表示参数是通过请求体提交还是通过url参数提交
 * 		multiple： 表示是否是一次http请求发送多个文件上传
 */
(function($){

	function FilesUploader(files, uploadUrl, opts){
		if(typeof files === undefined || typeof files === null){
			throw 'please pass file object.';
		}
	
	    this.files = files.length ? files : [files];
	    this.uploadUrl = uploadUrl;
	    this.opts = opts || {};
	    this.params = this.opts.params || {};
	
	    this.xhr = new XMLHttpRequest();
	    this._bindXhrEvent();
	}
	
	FilesUploader.prototype = {
	    upload: function(){  //上传文件
	    	try{
	    		this._check();
	    	}catch(e){
	    		if(this.opts.errorCallback){
        			this.opts.errorCallback(e.desc);
		    	}else{
		    		console.error(e.desc);
		    	}
	    		
	    		return;
	    	}

    		var uploadUrl = this.uploadUrl;
    		if(this.opts.urlParams){
                var concat = uploadUrl.indexOf('?') !== -1 ? '&' : '?',
                    strParams = $.param(this.params);
                uploadUrl += strParams ? concat + strParams : '';
            }
    		this.xhr.open("POST", uploadUrl);
	    	this.xhr.send(this._buildParams());
	    },
	    _check: function(){       //上传之前的预处理
	    	var self = this;
	    	for(var i=0, len=this.files.length; i<len; i++){
	            if( this.files[i].size > this._getMaxSize() ){
	                throw {
	                		code: '5',
	                		message: '文件过大',
	                		desc: '文件太大了<br>最大可上传' + Math.floor(self._getMaxSize() / (1024 * 1024)) + 'M'
	                	};
	            }
	        }
	    },
	    _buildParams: function(){
	    	var fd = new FormData(),
	    		fileCount = this.files.length;
	
	    	fd.append('fileCount', fileCount);
	    	var streamName = this.opts.streamNameAilas || 'fileObject';
	    	if(this.opts.multiple === true){
	    		for(var i=0; i<fileCount; i++){
				    fd.append('fileName' + i, this.files[i].name);
				    fd.append(streamName + i, this.files[i]);
			    }
	    	}else{
		    	fd.append(streamName, this.files[0]);
	    	}
	    	
	        for(var paramName in this.params) {
	            fd.append(paramName, this.params[paramName]);
	        }
	
	        return fd;
	    },
	    _getMaxSize: function(){
	        var maxSize = Number(this.opts.maxsize);
	        if(isNaN(maxSize) || maxSize === undefined){
	            return 10 * 1024 * 1024;
	        }
	        
	        return maxSize * 1024 * 1024;
	    },
	    _bindXhrEvent: function(){
	    	var xhr = this.xhr,
	    		self = this;
	
	    	xhr.upload.onprogress = function(e) {
	        	if(self.opts.progressCallback){
	            	self.opts.progressCallback(Math.round((e.loaded) * 100 / e.total));
	            }
	        };
	
	        if(this.opts.successCallback){
			    xhr.addEventListener('readystatechange', function(response) {
		        	try{
		                if (xhr.readyState == 4) {
		                	if(xhr.status == 200){
		                		self.opts.successCallback(JSON.parse(response.target.responseText));
		                	}else{
		                		if(self.opts.errorCallback){
		                			self.opts.errorCallback("系统错误！");
		        		    	}else{
		        		    		console.error("系统错误");
		        		    	}
		                	}
		                }
		            }catch(e){}
		        }, false);
	        }
	    }
	};
	
	
	/*
	 * 简单UI的上传，以缩略图为条状的
	 * uploadUrl（必须提供）: 表示处理文件上传的服务器端处理
	 * maxsize（可选）: 表示上传文件的最大大小，单位是M， 不传参数的话默认为5M
	 * initAttachData（可选）: 插件初始化的时候，初始化已经上传的附件列表， 主要用在编辑的场合
	 * attachIdAlias（可选）: 默认名字为id， 表示插件要从附件信息对象中获取id， 假如后台返回表示附件id的名字为attachId， 则初始化插件时attachIdAlias应设置为attachId
	 * attachNameAlias（可选）: 默认名字为name， 表示插件要从附件信息对象中获取id， 假如后台返回表示附件id的名字为attachName， 则初始化插件时attachNameAlias应设置为attachName
	 * errorCallback（可选）： 表示上传出错的时候的回调函数， 参数为错误的消息和attachView
	 * successCallback（可选）： 表示上传成功的回调函数， 参数为上传成功后后台返回的json数据和attachView
	 * previewCallback（可选）: 表示预览附件的回调函数，参数为上传成功后后台返回的json数据和attachView
	 * deleteCallback（可选）： 点击删除时的回调， 参数为上传成功后后台返回的json数据和attachView， 返回true或false， true表示后台成功删除附件
	 * 
	 * html结构：
	 * -------------------------------
	 * 	<div class="js_uploadContainer pl_20">
			<input type="hidden" name="attachIds" class="js_attachIds">			<!-- 存放最终成功传给后台的附件id，多个附件之间用逗号分隔，如"123, 456, 22"-->
			<input type="file" class="js_trueUpload hideit" accept="image/jpeg,application/pdf" multiple>	<!-- 真正的上传控件， 可配置成选择多个文件 -->
			<a href="#" class="btnOpH24 h24Silver in_block js_fakeUpload">上传</a>		<!-- 用户交互的控件 -->
			<div class="js_attachList"></div>			<!-- 缩略图和进度展示的容器 -->
		</div>
		
		
		插件调用示例：
		-----------------------------
		$('div.js_uploadContainer').simpleUpload({
			uploadUrl: '/uploadFile',
			initAttachData: [{id: '1', name: 'test1'}, {id: '2', name: 'test2'}],
			deleteCallback: function(data, attachView){
				return true;
			}
		});
	 */
	
	$.fn.dui = $.fn.dui || {};
	$.fn.dui.FilesUploader = FilesUploader;
	
	
	
	//插件基础类
	function UploadBase(uploadContainer, attachView, opts){
		this.uploadContainer = uploadContainer;
		this.attachView = attachView;
		
     	this.progressWidth = 100;
     	this.opts = opts || {};
	}
	
	//上传或删除附件， 更新隐藏域里的值
	UploadBase.updateAttachIds = function($h_attachIds, currAttachId, action){
		currAttachId = currAttachId || '';
		if($h_attachIds.length > 0){
			strArrOp(currAttachId, $h_attachIds, action);
			$h_attachIds.change();
		}
	}
	
	//进度条html
	UploadBase.progressBarHtml = '<div class="barContainer js_barContainer">\
									<div class="barBackground">\
										<div class="barFront js_barFront"></div>\
									</div>\
								 </div>';

	UploadBase.prototype = {
		init: function(){
			this.bindUpload();
			this.initAttachViewList();
		},
		bindUpload: function(){			//绑定上传控件
			var me = this;
			
			//点击上传
            me.uploadContainer.find('.js_fakeUpload').click(function(){
            	me.uploadContainer.find('.js_trueUpload').click();
			});

            //选择文件， 即时上传，为每个选择的文件创建对应的上传器
            me.uploadContainer.find('.js_trueUpload').change(function(){
            	var params = {};
            	if(me.opts.setParams){
            		me.opts.setParams(params, me.uploadContainer);
            	}

            	$.each(this.files, function(i, currentFile){
            		var $attachView = $(me.attachView);
            		me.uploadContainer.find('.js_attachList').append($attachView);

            		//初始化初始缩略图
            		$attachView.find('.js_attachName').html(currentFile.name).attr('title', currentFile.name);
            		
            		createUploader(currentFile, params, $attachView).upload();
            	});
		    });
            
            //实例化上传核心类，把回调和参数传递给和核心类
		    function createUploader(currentFile, params, $attachView){
				return new FilesUploader(currentFile, me.opts.uploadUrl, {
		    		maxsize: me.opts.maxsize,
		    		params: params,
		    		streamNameAilas: me.opts.streamNameAilas,
		    		urlParams: me.opts.urlParams,
		    		successCallback: function(data){			//上传成功
		    			me._successProcess(data, $attachView);
		    		},
		    		errorCallback: function(errMsg){			//上传失败
		    			me.errorCallback(errMsg, $attachView);
		    		},
		    		progressCallback: function(percentage){		//上传中
		    			$attachView.find('.js_barFront').width(Math.floor(me.progressWidth * percentage / 100));
		    		}
		    	});
			}
		},
		_successProcess: function(data, $attachView){
			var me = this;

			me.successCallback(data, $attachView);

			//把上传成功的附件ID添加到隐含域中
			UploadBase.updateAttachIds(me.uploadContainer.find('.js_attachIds'), data[me.opts.attchIdAlias || 'id'], 1);
			
			//绑定事件
			if(me.opts.previewCallback){
				$attachView.find('.js_preview').click(function(){
					me.opts.previewCallback(data, $attachView);
				});
			}

			//删除附件
			if(me.opts.deleteCallback){
				$attachView.find('.js_delete').click(function(){
					if(confirm('确定删除？')){
						if(me.opts.deleteCallback(data, $attachView)){
			    			UploadBase.updateAttachIds(me.uploadContainer.find('.js_attachIds'), data[me.opts.attchIdAlias || 'id'], 0);
							$attachView.remove();
						}
					}
				});
			}
		},
		initAttachViewList: function(){				//初始化附件列表
			var me = this,
				$attachIds = me.uploadContainer.find('.js_attachIds');

			if(me.opts.initAttachData){
				
				$.each(me.opts.initAttachData, function(i, currentFileData){
					var $attachView = $(me.attachView);

					me.uploadContainer.find('.js_attachList').append($attachView);
					me._successProcess(currentFileData, $attachView);
				});
			}
		}
	};

	$.fn.extend({
	    uploadPicture: function(opts){
	        opts = $.extend({
	        	
	        }, opts || {});
				
	        return this.each(function() {
	        	var me = $(this),
	        		attachView = '<div class="pictureUploadView js_attachViewContainer">' +
									'<div class="contentContainer js_contentContainer">' + 
										'<div class="attachName"><span class="js_attachName"></span></div>' + 
										UploadBase.progressBarHtml +
									'</div>' +
								'</div>';
	        	
	        	//图片上传类
	        	function PictrueUploader(uploadContainer, attachView, config){
	        		UploadBase.call(this, uploadContainer, attachView, config);
	        		this.progressWidth = 160;
		 	    }
	        	
	 	        PictrueUploader.prototype = new UploadBase();
	 	        
	 	        //成功，更新成功视图
	 	        PictrueUploader.prototype.successCallback = function(resonseData, $attachView){
	 	        	if(this.opts.successCallback){
	 	        		this.opts.successCallback(resonseData, $attachView);
	 	        	}
	 	        };
	 	        
	 	        //失败， 更新失败视图
	 	        PictrueUploader.prototype.errorCallback = function(errMsg, $attachView){
		    		if(this.opts.errorCallback){
	 	        		this.opts.errorCallback(errMsg, $attachView);
	 	        	}else{
		 	        	this.buildDefaultErrorView(errMsg, $attachView);
		    		}
	 	        };
	 	        
	 	       PictrueUploader.prototype.buildDefaultErrorView = function(errMsg, $attachView){
	 	    	  $attachView.find('.js_barContainer').html('<div class="mt_15 center"><p class="red">' + errMsg +'</p><p class="mt_15"><a href="javascript:;" class="btn-small btn-silver in_block js_errorDel">删除</a></p></div>');
	 	 		
	 	    	  $attachView.find('.js_barContainer').find('.js_errorDel').click(function(){
	 	    		  $(this).closest('.js_attachViewContainer').remove();
	 	    	  });
	 	       };

	 	       new PictrueUploader(me, attachView, opts).init();
	        });
	    },
		uploadDocument: function(opts){
	        opts = $.extend({
	        	
	        }, opts || {});
				
	        return this.each(function() {
	        	var me = $(this),
	        		attachView = '<div class="documentUploadView js_attachViewContainer">' + 
									'<div class="attachName"><span class="in_block icon_doc mr_5"></span><span class="js_attachName"></span></div>' + 
									UploadBase.progressBarHtml +
								 '</div>';
	        	
	        	//图片上传类
	        	function DocumentUploader(uploadContainer, attachView, opts){
	 	        	UploadBase.call(this, uploadContainer, attachView, opts);
	        		this.progressWidth = 80;
		 	    }
	        	
	 	        DocumentUploader.prototype = new UploadBase();
	 	        DocumentUploader.prototype.successCallback = function(responseData, $attachView){
	 	        	if(this.opts.successCallback){
	 	        		this.opts.successCallback(responseData, $attachView);
	 	        	}else{
		 	        	this.buildDefaultSuccessView(responseData, $attachView);
		    		}
	 	        };
	 	        DocumentUploader.prototype.errorCallback = function(errMsg, $attachView){
	 	        	if(this.opts.errorCallback){
	 	        		this.opts.errorCallback(errMsg, $attachView);
	 	        	}else{
		 	        	this.buildDefaultErrorView(errMsg, $attachView);
		    		}
	 	        };
	 	       
	 	       DocumentUploader.prototype.buildDefaultSuccessView = function(responseData, $attachView){
	 	    	   	var $previewView = $('<a href="javascript:;" target="_blank" class="js_preview">' + responseData[this.opts.attachNameAlias || 'name'] + '</a>'),
	 	    	   		$deleteView = $('<a href="javascript:;" class="grey999 js_delete">删除</a>');
	
	 	    	   	$attachView.find('.js_attachName').html($previewView);
	 	    	   	$attachView.find('.js_barContainer').html($deleteView);
	 	       };

	 	       DocumentUploader.prototype.buildDefaultErrorView = function(errMsg, $attachView){
	 	    	   $attachView.find('.js_barContainer').html('<span class="red">' + errMsg +'</span><a href="javascript:;" class="js_failDelete ml_5">删除</a>');
	 	 		
	 	    	   $attachView.find('.js_barContainer').find('.js_failDelete').click(function(){
	 	    		   $(this).closest('.js_attachViewContainer').remove();
	 	    	   });
	 	       };	 	       
	 	       
	 	       new DocumentUploader(me, attachView, opts).init();
	        });
	    }
	});
	
})(jQuery);