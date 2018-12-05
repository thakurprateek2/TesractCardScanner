var finalData;
var phoneNumbers = [];
var emailIds = [];
var websites = [];
var nameShortLists = [];

function extractText(data) {
    data.lines.forEach((line) => {
        console.log(line.text);
        console.log(line.baseline, (line.baseline['x1'] - line.baseline['x0']));
        console.log(line.bbox, (line.bbox['y1'] - line.bbox['y0']));
        var res = line.text.match(/\s*(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]\s*/g);
        var phoneRes = line.text.match(/\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/g);
        var phoneRes2 = line.text.match(/\s*(?:\+?(\d{1,3}))?[-. (]*(\d{5})[-. )]*(\d{5})[-. ]*(?: *x(\d+))?\s*/g);

        var emailRes = line.text.match(/([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)*/g);

        var urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var urlRegex = new RegExp(urlExpression);
        var urlRes = line.text.match(urlRegex);

        var wordsRes = (line.text + " ").match(/([a-zA-Z.]+\s)*/g);

        if (wordsRes) {
            wordsRes.forEach((words, index) => {
                if (words.length > 3) {
                    if (words.split(" ").length == 3 && words.split(" ")[2] == "") {
                        console.log("Name shortlist", words);
                        nameShortLists.push(words.trim());
                    }
                }
            });
        }
        if (urlRes) {
            urlRes.reduceRight(function (acc, item, index, object) {
                if (item.includes('@')) {
                    object.splice(index, 1);
                }
            }, []);
        }

        addToList(phoneRes, phoneNumbers);
        addToList(phoneRes2, phoneNumbers);
        addToList(emailRes, emailIds);
        addToList(urlRes, websites);

        console.log(phoneRes);
        console.log(phoneRes2);
        console.log(emailRes);
        console.log(urlRes);
        console.log(wordsRes);

        console.log("============================================================");
        console.log("============================================================");
        // console.log(line.baseline);

    });
    setValuesInInputs();
}


function addToList(array, list) {
    if (array) {
        array.forEach((val) => {
            if (val.length) {
                list.push(val.trim());
            }
        });
    }
}

function setValuesInInputs(params) {
    setValue("inputPhone", phoneNumbers);
    setValue("inputEmail", emailIds);
    setValue("inputWebSite", websites);
    setValue("inputFirstName", nameShortLists);
}

function setValue(inputId, array) {
    if (array && array.length) {
        $('#' + inputId).val(array[0]);
    }
}

function reset() {
    $('form').find("input[type=text], textarea, input[type=email]").val("");
    finalData;
    phoneNumbers = [];
    emailIds = [];
    websites = [];
    nameShortLists = [];
}

function progressUpdate(packet) {
    var progressMessage = $('#progressStatus');
    if (packet.status === 'loading tesseract core') {
        setStatus(Math.round(packet.progress * 100), 0, 0);
        progressMessage.text("Loading...");
    } else if (packet.status === 'initializing api') {
        setStatus(100, Math.round(packet.progress * 100), 0);
        progressMessage.text("Initializing...");
    } else if (packet.status === 'recognizing text') {
        if (packet.progress < 1) {
            progressMessage.text("Recognizing...");
        } else {
            progressMessage.text("Completed!");
            var progressSection = $('#progressSection');
            setTimeout(function () {
                progressSection.collapse('hide');
            }, 300);
        }
        setStatus(100, 100, Math.round(packet.progress * 100));
    } else if (packet.status === 'done') {
        finalData = packet.data;
        extractText(packet.data);
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
    $("#progressLoading").css("width", Math.round((loading / 100) * 15) + "%");
    $("#progressInitializing").css("width", Math.round((initializing / 100) * 30) + "%");
    $("#progressRecognizing").css("width", Math.round((recognizing / 100) * 55) + "%");
}

function recognizeFile(file) {
    displayImage(file);
    reset();
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