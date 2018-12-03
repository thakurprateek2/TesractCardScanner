function progressUpdate(packet) {
    var progressMessage = $('#progressStatus');
    if (packet.status === 'loading tesseract core') {
        setStatus(Math.round(packet.progress*100), 0, 0);
        progressMessage.text("Loading...");
    }else if (packet.status === 'initializing api') {
        setStatus(100, Math.round(packet.progress*100), 0);
        progressMessage.text("Initializing...");                
    }else if (packet.status === 'recognizing text') {
        if(packet.progress < 1){
            progressMessage.text("Recognizing...");                        
        }else{
            progressMessage.text("Completed!");
            var progressSection = $('#progressSection');
            setTimeout(function(){
                progressSection.collapse('hide');
            }, 300);
        }
        setStatus(100, 100, Math.round(packet.progress*100));
    }
    var log = document.getElementById('log');
    if (log.firstChild && log.firstChild.status === packet.status) {
        if ('progress' in packet) {
            var progress = log.firstChild.querySelector('progress')
            progress.value = packet.progress
        }
    } else {
        var line = document.createElement('div');
        line.status = packet.status;
        var status = document.createElement('div')
        status.className = 'status'
        status.appendChild(document.createTextNode(packet.status))
        line.appendChild(status)
        if ('progress' in packet) {
            var progress = document.createElement('progress')
            progress.value = packet.progress
            progress.max = 1
            line.appendChild(progress)
        }
        if (packet.status == 'done') {
            var pre = document.createElement('pre')
            pre.appendChild(document.createTextNode(packet.data.text))
            line.innerHTML = ''
            line.appendChild(pre)
        }
        log.insertBefore(line, log.firstChild)
    }
}

function setStatus(loading, initializing, recognizing) {
    $("#progressLoading").css("width", Math.round((loading/100)*15) + "%");
    $("#progressInitializing").css("width", Math.round((initializing/100)*30) + "%");
    $("#progressRecognizing").css("width", Math.round((recognizing/100)*55) + "%");
}

function recognizeFile(file) {
    displayImage(file);
    document.querySelector("#log").innerHTML = '';

    // Tesseract.recognize(file).progress(function(data){console.log(data)}).then(function(data){console.log(data)})

    // return;
    Tesseract.recognize(file, {
        // lang: document.querySelector('#langsel').value
        lang: 'eng'
        
    })
        .progress(function (packet) {
            console.info(packet)
            progressUpdate(packet)
        })
        .then(function (data) {
            console.log(data)
            progressUpdate({ status: 'done', data: data })
        })
}

function displayImage(file) {

    var reader = new FileReader();

    reader.onload = function (e) {
        $('#image').css('display', '')
        $('#image')
        .attr('src', e.target.result)
        $('#imageSection').collapse();
        $('#progressSection').collapse('show');
        
        // .width(100)
        // .height(200);
    };

    reader.readAsDataURL(file);

}