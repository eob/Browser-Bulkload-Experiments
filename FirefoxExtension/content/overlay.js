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
  }
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

  fileSizes:["5","500","1000","5000","10000","50000","100000","200000"],
  currentFileSize:0,

  strategies:2,
  currentStrategy:0,

  iterationsPerFile:5,
  currentIteration:0,
  logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),

  time:0,
  logFile:null,
  converter:null,
  
  beginTest:function(event) {
      event.stopPropagation();  

      var toFilename = "browser.csv";
      var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                      .createInstance(Components.interfaces.nsIWebBrowserPersist);
      databaseSaver.logFile = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
      databaseSaver.logFile.initWithPath("~/" + toFilename); // download destination
                      
      // Remove the file if it exists
      if (databaseSaver.logFile.exists()) {
         databaseSaver.logFile.remove(false);          
      }
      databaseSaver.logFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE,777);

      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                               createInstance(Components.interfaces.nsIFileOutputStream);  

      // use 0x02 | 0x10 to open file for appending.  
      foStream.init(databaseSaver.logFile, 0x02 | 0x08 | 0x20, 0666, 0);   
      // write, create, truncate  
      // In a c file operation, we have no need to set file mode with or operation,  
      // directly using "r" or "w" usually.  

      // if you are sure there will never ever be any non-ascii text in data you can   
      // also call foStream.writeData directly  
      databaseSaver.converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                                createInstance(Components.interfaces.nsIConverterOutputStream);  
      databaseSaver.converter.init(foStream, "UTF-8", 0, 0);  
      databaseSaver.runTestOnce();
  },
  logTime:function(t) {
     var str = databaseSaver.fileSizes[databaseSaver.currentFileSize] + "," + databaseSaver.currentStrategy + "," + databaseSaver.currentIteration + "," + t + '\n';
     databaseSaver.converter.writeString(str);  
  },
  incrementLoopVariables:function() {
      // alert("incrementLoopVariables");
      databaseSaver.currentIteration += 1;
      if (databaseSaver.currentIteration >= databaseSaver.iterationsPerFile) {
          // We've done all the iterations. Reset and change strategy
          databaseSaver.currentIteration = 0;
          
          databaseSaver.currentStrategy += 1;
          if (databaseSaver.currentStrategy >= databaseSaver.strategies) {
              // We've done all the strategies. Reset and change the file
              databaseSaver.currentStrategy = 0;
              
              databaseSaver.currentFileSize += 1;
              if (databaseSaver.currentFileSize >= databaseSaver.fileSizes.length) {
                  // We've done all the file sizes. Return false.
                  databaseSaver.converter.close(); // this closes foStream
            
                  alert("TEST DONE");
                  return false;
              }
          }          
          
      }
      return true;
  },
  runTestOnce: function() {
      /*
       * Setup parameters for the test
       */
      var urlPrefix  = "http://marcua.csail.mit.edu:7002/gzip-static/bulkload_"; 
      var sqliteSuffix  = ".sqlite"; 
      var jsonSuffix  = ".json"; 

      var fileSize = databaseSaver.fileSizes[databaseSaver.currentFileSize];
      // alert("runTestOnce -> Strategy " + databaseSaver.currentStrategy);
      if (databaseSaver.currentStrategy == 0) {
          // alert("Routing to SQLite");
          // SQLite
          var url = urlPrefix + fileSize + sqliteSuffix;
          databaseSaver.runSqliteTestOnce(url);
      }
      else if (databaseSaver.currentStrategy == 1) {
          // JSON
          // alert("Routing to JSON");
          var url = urlPrefix + fileSize + jsonSuffix;
          databaseSaver.runJsonTestOnce(url);
      }
  },
  runSqliteTestOnce: function(url) { 
      var ko = new Date();
      var ji = ko.getTime();
      var toFilename = ji + ".sqlite";
      
      // var toFilename = "testdb.sqlite";
      // databaseSaver.deleteFile("~/" + toFilename);
      var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                      .createInstance(Components.interfaces.nsIWebBrowserPersist);
      var file = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath("~/" + toFilename); // download destination

      var dbfile = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
      dbfile.initWithPath("~/testdb.sqlite"); // download destination
                      
      // Remove the file if it exists
      
     persist.progressListener = {
        onDoanloadStateChange: function(aState, aDownload) {
        },
        // onStatusChange: function(aWebProgress,
        //                     aRequest,
        //                     aStatus,
        //                     aMessage) {
        //     alert("Status changed to: " + aStatus);
        // },
        onStateChange: function(nsIWebProgress, nsIRequest, aStateFlags, aStatus, aDownload) {
        },
        onProgressChange: function(aWebProgress,
                                aRequest,
                                aCurSelfProgress,
                                aMaxSelfProgress,
                                aCurTotalProgress,
                                aMaxTotalProgress) {
            if (aCurTotalProgress == aMaxTotalProgress) {

                var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                                        .getService(Components.interfaces.mozIStorageService);  
                var mDBConn = storageService.openDatabase(dbfile);

                var time2 = (new Date).getTime();
                var time1 = databaseSaver.time;
                databaseSaver.time = 0;

                databaseSaver.logTime(time2-time1);
                // alert("SQLite Test Finished")
                if (databaseSaver.incrementLoopVariables()) {
                    databaseSaver.runTestOnce();
                }


            }
        }
      };                  

      var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService)
                      .newURI(url, null, null);

      databaseSaver.time = (new Date).getTime();
      persist.saveURI(obj_URI, null, null, null, "", file);
  },
  deleteFile:function(path) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(path); 
      if (file.exists()) {
          file.remove(false);          
      }
  },
  runJsonTestOnce:function(url) {
      var ko = new Date();
      var ji = ko.getTime();
      var filename = ji + ".sqlite";
      var file = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsILocalFile);
     file.initWithPath("~/" + filename); // download destination

      // databaseSaver.deleteFile("~/" + filename);
      databaseSaver.time = (new Date).getTime();
      jQuery.get(url, function(results) {
          var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                                         .getService(Components.interfaces.mozIStorageService); 
          var db = storageService.openDatabase(file);
          var insert = "INSERT INTO noise VALUES (";
          var create = "CREATE TABLE noise(";
          for (var col = 0; col < results[0].length; col++) {
              var index  = col + 1;
              insert += "?" + index + ", " ;
              create += "var" + index + " VARCHAR(255), ";
          }
          insert = insert.substr(0, insert.length - 2);
          create = create.substr(0, create.length - 2);
          insert += ");";
          create += ");";

          var cStmt;
          try {
              cStmt = db.createStatement(create);
          } catch (e) { 
              alert(db.lastErrorString);
          }

          // successFunc returns a function which you can pass to mozStorage's handleCompletion:
          //   it prints badmsg on failure, or calls goodFunc on success.
          var successFunc = function(badmsg, goodFunc) {
            var dbFunc = function(aReason) {
                if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) { 
                    print(badmsg);  
                } else {
                    goodFunc();
                }
            };
            return dbFunc;
          };
          // Call once inserts are done.
          var insertFunc = successFunc("Inserts failed!", function() {
              var time2 = (new Date).getTime();
              var time1 = databaseSaver.time;
              databaseSaver.time = 0;
              databaseSaver.logTime(time2-time1);
              // alert("JSON Test Finished")
              if (databaseSaver.incrementLoopVariables()) {
                  databaseSaver.runTestOnce();
              }
              
          });
          // Call once create is done.
          var createFunc = successFunc("Create failed!", function() {
              var iStmt;
              try{
                  iStmt = db.createStatement(insert);
              } catch (e) { 
                  alert(db.lastErrorString);
              }
              var params = iStmt.newBindingParamsArray();
              for (var rownum in results) {
                 var bp = params.newBindingParams();
                 var row = results[rownum];
                 for (var colnum in row) {
                     bp.bindByIndex(colnum, row[colnum]);
                 }
                 params.addParams(bp);
              }
              iStmt.bindParameters(params);
              db.executeAsync([iStmt], 1, {handleCompletion: insertFunc});
          });
          // execute create
          db.executeAsync([cStmt], 1, {handleCompletion: createFunc});
      }, "json");  // end AJAX request
  }  // end saveJSON
};

// The last 'true' allows unpriviledged javascript to access this handler
// document.addEventListener("SaveDatabaseEvent", databaseSaver.saveJSON, false, true);
document.addEventListener("SaveDatabaseEvent", databaseSaver.beginTest, false, true);