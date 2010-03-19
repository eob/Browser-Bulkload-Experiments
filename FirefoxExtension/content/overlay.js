/*
 * Copyright (c) 2010 Edward Benson
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * */

var filecache = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("filecache-strings");
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },

};
window.addEventListener("load", function(e) { filecache.onLoad(e); }, false);

var databaseSaver = {  
  // Directory to save sessions (nsILocalFile)  
  // _dir: null,  
  // // Initialization  
  // init: function() { 
  //     var dirSvc = Components.classes["@mozilla.org/file/directory_service;1"]
  //     .getService(Components.interfaces.nsIProperties);  
  //     this._dir = dirSvc.get("ProfD", Components.interfaces.nsILocalFile); 
  //     this._dir.append("sessionstore"); 
  //     if (!this._dir.exists()) 
  //        this._dir.create(this._dir.DIRECTORY_TYPE, 0700);  
  // },  
  // uninit: function() { 
  //     this._dir = null;  
  // },  
  save: function(event) { 
      event.stopPropagation();
      alert("hi");
      // var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]  
      //   .getService(Components.interfaces.nsISessionStore); 
      //    var state = ss.getBrowserState();  
      // var fileName = "session_" + Date.now() + ".js";  
      // var file = this._dir.clone();  
      // file.append(fileName); 
      // this._writeFile(file, state);  
      var uri = "http://people.csail.mit.edu/eob/testdb.sqlite";
      var toFilename = "testdb.sqlite";

      var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                      .createInstance(Components.interfaces.nsIWebBrowserPersist);

      var file = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath("~/" + toFilename); // download destination
                      
     persist.progressListener = {
        onDoanloadStateChange: function(aState, aDownload) {
        },
        onStateChange: function(nsIWebProgress, nsIRequest, aStateFlags, aStatus, aDownload) {
            if (aStateFlags && 0x00000010) {
                // Try to open a database connection to the file
                var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                                        .getService(Components.interfaces.mozIStorageService);  
                var mDBConn = storageService.openDatabase(file);
                alert("Done");
            }
        },
        onProgressChange: function() {}        
      }                  

      var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService)
                      .newURI(uri, null, null);
      persist.saveURI(obj_URI, null, null, null, "", file);
  },
  saveJSON: function(event) { 
      event.stopPropagation();
      alert("hi");
      var uri = "http://people.csail.mit.edu/marcua/10.json";
      var toFilename = "testdb.sqlite";
      jQuery.get(uri, function(results) {
          results = results.Posts.results;
          var file = Components.classes["@mozilla.org/file/local;1"]
                                       .createInstance(Components.interfaces.nsILocalFile);
          file.initWithPath("~/" + toFilename); // download destination
          var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                                         .getService(Components.interfaces.mozIStorageService); 
          var db = storageService.openDatabase(file);
          var sqlStatement = "INSERT INTO test VALUES (";
          for (var col = 0; col < results[0].length; col++) {
              var index  = col + 1;
              sqlStatement += "?" + index + ", " ;
          }
          sqlStatement = sqlStatement.substr(0, sqlStatement.length - 2);
          sqlStatement += ");";
          alert(sqlStatement);
          alert("create table!!");
/*          var stmt = db.createStatement(sqlStatement);
          var params = stmt.newBindingParamsArray();
          for (var rownum in results) {
              var bp = params.newBindingParams();
              var row = results[rownum];
              for (var colnum in row) {
                  bp.bindByIndex(colnum, row[colnum]);
              }
              params.addParams(bp);
          }
          stmt.bindParameters(params);
          // execute as a single transaction
          db.executeAsync([stmt], 1, {  
              handleCompletion: function(aReason) {  
                 if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)  
                    print("Query canceled or aborted!");  
                 } else {
                     alert("Done");
                 }
          });  // end async execution
          */
      }, "json");  // end AJAX request
  }  // end saveJSON
};

// The last 'true' allows unpriviledged javascript to access this handler
document.addEventListener("SaveDatabaseEvent", databaseSaver.saveJSON, false, true);