
function loadFile(fileid){
	console.log(fileid);
	 var request = gapi.client.request({
	        'path': '/drive/v2/files/'+fileid,
	        'method': 'GET'});
	 
	  request.execute(function(resp) {
	    console.log('Title: ' + resp.title);
	    console.log('Description: ' + resp.description);
	    console.log('MIME type: ' + resp.mimeType);
		  if (resp.downloadUrl) {
 		    var accessToken = gapi.auth.getToken().access_token;
 		    var xhr = new XMLHttpRequest();
 		    xhr.open('GET', resp.downloadUrl);
 		    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
 		    xhr.onload = function() {
 		      console.log("RESPONSE: "+JSON.stringify(xhr.responseText));
 		      editor.setValue(xhr.responseText);
 		    };
 		    xhr.onerror = function() {
 		      alert("ERROR");
 		    };
 		    xhr.send();
 		  } else {
 		    alert("ERROR");
 		  }
	  });
}
$("#login").click(function(){
				
				
			    gapi.auth.authorize(config, function() {
			     $("#login").replaceWith("<span id='save'>Save</span>|<span id='load'>Load</span>|<span id='logout'>Logout</span>");
			     $("#load").click(function(){

					 fn = prompt("Filename: ");
					    gapi.client.load('drive', 'v2', function() {
					 var request = gapi.client.drive.files.list({
				          'q': "title='"+fn+"'"
				        });
					 request.execute(function(resp) {
						loadFile(resp.items[0].id);
						 
					 });
					    });
			    	 fileid="0Bw7PrlWT3aWaVWQyLU5KZ1I1RVU";
			    	
			    		
			    		  });
			    		

			    		
			    	
			    		
			    	 
			     
			     
			     
			     $("#save").click(function(){
						txt = editor.getValue();
						filename = prompt("Enter a filename: ")
						 var metadata = {
							      'title': filename,
							      'mimeType': "text/plain"
							    };

						  const boundary = '-------314159265358979323846';
						  const delimiter = "\r\n--" + boundary + "\r\n";
						  const close_delim = "\r\n--" + boundary + "--";

							    var multipartRequestBody =
							        delimiter +
							        'Content-Type: application/json\r\n\r\n' +
							        JSON.stringify(metadata) +
							        delimiter +
							        'Content-Type: text/plain\r\n' +
							        'Content-Transfer-Encoding: utf8\r\n' +
							        '\r\n' +
							        txt +
							        close_delim;

						  
						
							    var request = gapi.client.request({
							        'path': '/upload/drive/v2/files',
							        'method': 'POST',
							        'params': {'uploadType': 'multipart'},
							        'headers': {
							          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
							        },
							        'body': multipartRequestBody});

						        
						
						    request.execute();
						  
						
						
						
						
				
			});
			     
			    });

	
	});
