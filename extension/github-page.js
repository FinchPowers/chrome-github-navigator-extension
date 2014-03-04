function cleanFilesList(fileList){
    $(fileList).find(".commit.commit-tease.js-details-container").remove();
    $(fileList).find(".branch-infobar").remove();
    if($(fileList).find("tr:first a:first").html() == ".."){
        $(fileList).find("tr:first").remove()
    }
}

function updateUrl(anchor){
    window.history.pushState(
        {"ghNavigatorUrl" : $(anchor).attr("href")},
        $(anchor).attr("title"),
        $(anchor).attr("href"))
}

function fileBrowserOnClick(){
    fileAction(this, true);
    return false;
}

function fileAction(anchor, pushState){
    var icon_span = $(anchor).parents("tr:first").find("td:first span");
    var href = $(anchor).attr("href");
    if ($(icon_span).hasClass("octicon-file-directory")){
        if($(anchor).parents("tr:first").next().hasClass("ghExtensionExtend")){
            //Already exists
            $(anchor).parents("tr:first").next().toggle();
        }else{
            //First time, fetch it
            $(anchor).parents("tr:first").after(
                "<tr class='ghExtensionExtend'>"
                + "<td colspan=4 style='padding-left: 10px;'>Loading</td>"
                + "</tr>");
            $.get(href, function(html){

                html = $(html).find(".bubble.files-bubble");
                cleanFilesList(html);
                text = $(html).html();
                $(anchor).parents("tr:first").next().find("td").html(text);
            });
        }
    } else if ($(icon_span).hasClass("octicon-file-submodule")) {
        //Nav out to the submodule
        return true;
    } else {
        if(pushState){
            updateUrl(anchor);
        }
        $(".githubPagesHighlighted").removeClass("githubPagesHighlighted");
        $(anchor).parents("tr:first").addClass("githubPagesHighlighted");
        if($(anchor).data("cachedFile")){
            $("#fileViewer").find("table").remove();
            $("#fileViewer").html(
                "<table>" + $(anchor).data("cachedFile") + "</table>");
        }else{
            $("#fileViewer").html("Loading");
            $.get(href, function(html){
                var text;
                if($(html).find(".file-code.file-diff.tab-size-8").size()){
                    //standard code viewing pane
                    text = $(html).find(".file-code.file-diff.tab-size-8")
                           .html();
                }else if($(html).find(".blob.instapaper_body").size()){
                    //markdown
                    text = $(html).find(".blob.instapaper_body").html();
                }else if($(html).find(".blob-wrapper").size()){
                    //images
                    text = $(html).find(".blob-wrapper").html();
                }else{
                    throw "Cannot handle the selected resource";
                }
                $("#fileViewer").html("<table>" + text + "</table>");
                $(anchor).data("cachedFile", text);
            });
        }
    }
}

function disableFileBrowser(){
    $("#fileBrowser, #fileViewer").hide();
    $(".wrapper, .container").show();
}
function enableFileBrowser(){
    $("#fileBrowser, #fileViewer").show();
    $(".wrapper, .container").hide();
}

function toggleFileBrowser(){
    if($("#fileBrowser:visible").size()){
        disableFileBrowser();
    }else{
        enableFileBrowser();
    }
}

function init(){
    $(".wrapper, .container").hide();
    $("body").append(
        "<div id='fileBrowser'>"
        + $(".bubble.files-bubble").html() 
        + "</div>"
        + "<div id='fileViewer'></div>");
    cleanFilesList($("#fileBrowser"));
    $("#fileBrowser").parents().css("height", "100%");

    $("#fileBrowser").on("click", "a", fileBrowserOnClick);
    window.history.pushState( {"ghNavigatorUrl" : ""}, "", "");
    window.onpopstate = function(event){
        if(event.state != null){
            if(event.state["ghNavigatorUrl"] == ""){
                disableFileBrowser();
            }else{
                if(!$("#fileBrowser:visible").size()){
                    enableFileBrowser();
                }
                url = event.state["ghNavigatorUrl"].replace(/\//g, "\\/")
                    .replace(/\./g, "\\.");
                fileAction($("#fileBrowser").find("a[href=" + url + "]"), false);
            }
        }else{
            // clicking over a file line
            return false;
        }
    }
}


if($("#fileBrowser").size()){
    toggleFileBrowser();
}else{
    init();
}
