const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
var allQuestions = [];

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    }, false);
});

// Handle dropped files
dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
}, false);

// Click to browse
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        
        // Check if it's a text file
        if (file.type === 'text/plain' || file.name.endsWith('.xml')) {
            readTextFile(file);
        } else {
            console.log('Please drop a text file (.txt)');
            alert('Please drop a text file (.txt)');
        }
    }
}



class EssayQuestion{
    constructor(name, text, defaultGrade) {
        this.name = name;
        this.text = text;
        this.defaultGrade = defaultGrade;
    }

    getBBXMLText() {
        return `<?xml version='1.0' encoding='UTF-8'?>
        <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                        adaptive="false" timeDependent="false" identifier="QUE_ESSAY_001" title="${this.name}">
        
        <responseDeclaration cardinality="single" baseType="string" identifier="RESPONSE"/>
        
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
            <defaultValue>
            <value>0</value>
            </defaultValue>
        </outcomeDeclaration>
        
        <outcomeDeclaration identifier="FEEDBACKBASIC" cardinality="single" baseType="identifier"/>
        
        <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
            <defaultValue>
            <value>${this.defaultGrade}</value>
            </defaultValue>
        </outcomeDeclaration>
        
        <itemBody>
            <div>
            <div>
                ${this.text}
            </div>
            </div>
            <extendedTextInteraction responseIdentifier="RESPONSE"/>
        </itemBody>
        
        </assessmentItem>
    `
    }
}

class MultipleChoiceQuestion{
    constructor(name, text, generalFeedback, defaultGrade, penalty, single, shuffleAnswers) {
        this.name = name;
        this.text = text;
        this.generalFeedback = generalFeedback;
        this.defaultGrade = defaultGrade;
        this.penalty = penalty;
        this.single = single; // true or false
        this.shuffleAnswers = shuffleAnswers; // true or false
        this.answers = []; // array of {text: "", fraction: 100 or 0, feedback: ""}
    }

    addAnswer(text, fraction) {
        this.answers.push({'text': text, 'fraction': fraction});
    }

    getBBXMLText() {

        let answers = ``;
        let mapping = "";
        let correctResponses = 0; 
        for(let i = 0; i < this.answers.length; i++){
            if(this.answers[i].fraction > 0){
                correctResponses++;
                answers += `<value>answer_${i + 1}</value>`;
                mapping += ` <mapEntry mapKey="answer_${i + 1}" mappedValue="${this.answers[i].fraction / 100}"/>`
            }else{
                mapping += ` <mapEntry mapKey="answer_${i + 1}" mappedValue="0"/>`
            }

        }

        let correctResponseArea = ` <correctResponse>
                ${answers}
            </correctResponse>`

        if (correctResponses > 1){
            correctResponseArea += `<mapping defaultValue="0">
            ${mapping}
            </mapping>
            `
        }
        

        let result = ` <?xml version='1.0' encoding='UTF-8'?>
            <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                            adaptive="false" timeDependent="false" identifier="QUE_MC_001" title="${this.name}">
            
            <responseDeclaration cardinality="multiple" baseType="identifier" identifier="RESPONSE">
                ${correctResponseArea}
            </responseDeclaration>
            
            <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
                <defaultValue>
                <value>0</value>
                </defaultValue>
            </outcomeDeclaration>
            
            <outcomeDeclaration identifier="FEEDBACKBASIC" cardinality="single" baseType="identifier"/>
            
            <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
                <defaultValue>
                <value>0</value>
                </defaultValue>
            </outcomeDeclaration>
            
            <itemBody>
                <div>
                <div>
                    ${this.text}
                </div>
                </div>
                <choiceInteraction responseIdentifier="RESPONSE" maxChoices="0" shuffle="false">`


                for(let i = 0; i < this.answers.length; i++){
                result += `<simpleChoice identifier="answer_${i + 1}" fixed="true">
                        <div>
                        <p>${this.answers[i].text}</p>
                        </div>
                    </simpleChoice>`;
                }

                result += `</choiceInteraction>
            </itemBody>
            
            <responseProcessing>
                <responseCondition>
                <responseIf>
                    <match>
                    <variable identifier="RESPONSE"/>
                    <correct identifier="RESPONSE"/>
                    </match>
                    <setOutcomeValue identifier="SCORE">
                    <variable identifier="MAXSCORE"/>
                    </setOutcomeValue>
                    <setOutcomeValue identifier="FEEDBACKBASIC">
                    <baseValue baseType="identifier">correct_fb</baseValue>
                    </setOutcomeValue>
                </responseIf>
                <responseElse>
                    <setOutcomeValue identifier="FEEDBACKBASIC">
                    <baseValue baseType="identifier">incorrect_fb</baseValue>
                    </setOutcomeValue>
                </responseElse>
                </responseCondition>
            </responseProcessing>
            
            <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="correct_fb">
                <div>
                <div>Your answer is correct.</div>
                </div>
            </modalFeedback>
            
            <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="incorrect_fb">
                <div>
                <div>Your answer is incorrect.</div>
                </div>
            </modalFeedback>
            
            </assessmentItem>
        `;
        return result;
    }
}

class ShortAnswerQuestion{
    constructor(name, text, generalFeedback, defaultGrade) {
        this.name = name;
        this.text = text;
        this.generalFeedback = generalFeedback;
        this.defaultGrade = defaultGrade;
        this.answers = []; // array of {text: "", fraction: 100 or 0, feedback: ""}
    }

    addAnswer(text, fraction) {
        this.answers.push({"text":text, "fraction":fraction});
    }

    getBBXMLText() {

        let mapEntries = ""; 

        this.answers.forEach(ans => {
            mapEntries += `<mapEntry mapKey="${ans.text}" caseSensitive="false" mappedValue="100"/>`
        });

        let result =  `<?xml version='1.0' encoding='UTF-8'?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                adaptive="false" timeDependent="false" identifier="QUE_SA_001" title="">
  
  <responseDeclaration cardinality="single" baseType="string" identifier="RESPONSE">
    <correctResponse>
      <value>${this.answers[0].text}</value>
    </correctResponse>
    <mapping defaultValue="0">
      ${mapEntries}
    </mapping>
  </responseDeclaration>
  
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  
  <outcomeDeclaration identifier="FEEDBACKBASIC" cardinality="single" baseType="identifier"/>
  
  <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>100.0</value>
    </defaultValue>
  </outcomeDeclaration>
  
  <itemBody>
    <div>
      <div>
        ${this.text}
      </div>
    </div>
    <textEntryInteraction responseIdentifier="RESPONSE" expectedLength="50"/>
  </itemBody>
  
  <responseProcessing>
    <setOutcomeValue identifier="SCORE">
      <mapResponse identifier="RESPONSE"/>
    </setOutcomeValue>
    <responseCondition>
      <responseIf>
        <gte>
          <variable identifier="SCORE"/>
          <baseValue baseType="float">100.0</baseValue>
        </gte>
        <setOutcomeValue identifier="FEEDBACKBASIC">
          <baseValue baseType="identifier">correct_fb</baseValue>
        </setOutcomeValue>
      </responseIf>
      <responseElse>
        <setOutcomeValue identifier="FEEDBACKBASIC">
          <baseValue baseType="identifier">incorrect_fb</baseValue>
        </setOutcomeValue>
      </responseElse>
    </responseCondition>
  </responseProcessing>
  
  <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="correct_fb">
    <div>
      <div>Your answer is correct.</div>
    </div>
  </modalFeedback>
  
  <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="incorrect_fb">
    <div>
      <div>Your answer is incorrect.</div>
    </div>
  </modalFeedback>
  
</assessmentItem>
        `
        return result;
    }
}

class TrueFalseQuestion {
    constructor(name, text, generalFeedback, defaultGrade) {
        this.name = name;
        this.text = text;
        this.generalFeedback = generalFeedback;
        this.defaultGrade = defaultGrade;
        this.answers = []; // array of {text: "", fraction: 100 or 0, feedback: ""}
    }

    addAnswer(text, fraction, feedback="") {
        this.answers.push({"text":text, "fraction":fraction, "feedback":feedback});
    }

    getBBXMLText() {
    //TODO: Improve the feedback portion of this.
    let correct = this.answers.filter(ans =>{
        return ans.fraction > 50;
    })

    if(correct.length > 1){
        console.log("Error, multiple correct answers found`"); 
    }

        let result = `<?xml version='1.0' encoding='UTF-8'?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                adaptive="false" timeDependent="false" identifier="QUE_TF_001" title="${this.name}">
  
  <responseDeclaration cardinality="multiple" baseType="identifier" identifier="RESPONSE">
    <correctResponse>
        <value>${correct[0].text}</value>
    </correctResponse>
  </responseDeclaration>
  
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  
  <outcomeDeclaration identifier="FEEDBACKBASIC" cardinality="single" baseType="identifier"/>
  
  <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>${this.defaultGrade}</value>
    </defaultValue>
  </outcomeDeclaration>
  
  <itemBody>
    <div>
      <div>
        ${this.text}
      </div>
    </div>
    <choiceInteraction responseIdentifier="RESPONSE" maxChoices="0" shuffle="false">
    `

    this.answers.forEach(ans=>{
        result += `<simpleChoice identifier="${ans.text}" fixed="true">
        <div>
          <p>${ans.text}</p>
        </div>
      </simpleChoice>
      `
    })

   result +=  `</choiceInteraction>
  </itemBody>
  
  <responseProcessing>
    <responseCondition>
      <responseIf>
        <match>
          <variable identifier="RESPONSE"/>
          <correct identifier="RESPONSE"/>
        </match>
        <setOutcomeValue identifier="SCORE">
          <variable identifier="MAXSCORE"/>
        </setOutcomeValue>
        <setOutcomeValue identifier="FEEDBACKBASIC">
          <baseValue baseType="identifier">correct_fb</baseValue>
        </setOutcomeValue>
      </responseIf>
      <responseElse>
        <setOutcomeValue identifier="FEEDBACKBASIC">
          <baseValue baseType="identifier">incorrect_fb</baseValue>
        </setOutcomeValue>
      </responseElse>
    </responseCondition>
  </responseProcessing>`

    this.answers.forEach(ans=>{
        if(ans.feedback && ans.feedback.length > 0){
            result += `
            <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="${ans.text}_fb">
                <div>
                  <div>${ans.feedback}</div>
                </div>
              </modalFeedback>
            `
        }
    })
  
    result += `</assessmentItem>`
        return result;
    }
}

class MatchingQuestion{
    constructor(name, text, generalFeedback, defaultGrade) {
        this.name = name;
        this.text = text;
        this.generalFeedback = generalFeedback;
        this.defaultGrade = defaultGrade;
        this.pairs = []; // array of {question: "", answer: ""}
    }

    addPair(question, answer) {
        this.pairs.push({"question":question, "answer":answer});
    }

    getBBXMLText() {
        //TODO: Fix the pairs portion of this.
        let result = `
        TODO: Redo
        `
        return result;
    }
}


function readTextFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const contents = e.target.result;
        console.log('File contents:');
        // Work with my XML data here

        const parser = new DOMParser().parseFromString(contents, "text/xml");

        allQuestions = []; // reset the questions array

        let questions = parser.querySelectorAll("question");
        console.log(questions.length);

        //Meta Data 

        let metadata = Array.from(questions).filter(q => q.getAttribute("type") === "category");
        let title = "" 
        metadata.forEach(q => {
            let result = q.querySelector("text").textContent;
            let splitResult = result.split("/");
            title = splitResult[splitResult.length - 1];
        });

        //Essay Questions
        let essayQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "essay");
        essayQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let essayQuestion = new EssayQuestion(name, text, generalFeedback, defaultGrade);
            allQuestions.push(essayQuestion);
        });

        let MultipleChoiceQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "multichoice");
        MultipleChoiceQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let penalty = q.getAttribute("penalty") || "0";
            let single = q.getAttribute("single") === "true";
            let shuffleAnswers = q.getAttribute("shuffleanswers") === "true";
            let mcQuestion = new MultipleChoiceQuestion(name, text, generalFeedback, defaultGrade, penalty, single, shuffleAnswers);
            
            let answers = q.querySelectorAll("answer");
            answers.forEach(a => {
                let answerText = a.querySelector("text").textContent;
                let fraction = parseFloat(a.getAttribute("fraction")) || 0;
                mcQuestion.addAnswer(answerText, fraction);
            });

            allQuestions.push(mcQuestion);
        });

        let shortAnswerQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "shortanswer"); 
        shortAnswerQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let shortAnswerQuestion = new ShortAnswerQuestion(name, text, generalFeedback, defaultGrade);
            let answers = q.querySelectorAll("answer");
            answers.forEach(a => {
                let answerText = a.querySelector("text").textContent;
                let fraction = parseFloat(a.getAttribute("fraction")) || 0;
                shortAnswerQuestion.addAnswer(answerText, fraction);
            });
            allQuestions.push(shortAnswerQuestion);
        });

        let trueFalseQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "truefalse");
        trueFalseQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let tfQuestion = new TrueFalseQuestion(name, text, generalFeedback, defaultGrade);
            let answers = q.querySelectorAll("answer");
            answers.forEach(a => {
                let answerText = a.querySelector("text").textContent;
                let feedback = a.querySelector("feedback > text") ? a.querySelector("feedback > text").textContent : "";
                let fraction = parseFloat(a.getAttribute("fraction")) || 0;
                tfQuestion.addAnswer(answerText, fraction, feedback);
            });
            allQuestions.push(tfQuestion);
        });

        let matchingQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "matching");
        matchingQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let matchQuestion = new MatchingQuestion(name, text, generalFeedback, defaultGrade);
            let subquestions = q.querySelectorAll("subquestion");
            subquestions.forEach(sq => {
                let questionText = sq.querySelector("text").textContent;
                let answerText = sq.querySelector("answer").textContent;
                matchQuestion.addPair(questionText, answerText);
            });
            allQuestions.push(matchQuestion);
        });

        let dragAndDropMatchingQuestions = Array.from(questions).filter(q => q.getAttribute("type") === "ddmatch");
        dragAndDropMatchingQuestions.forEach(q => {
            let name = q.querySelector("name > text").textContent;
            let text = q.querySelector("questiontext > text").textContent;
            let generalFeedback = q.querySelector("generalfeedback > text") ? q.querySelector("generalfeedback > text").textContent : "";
            let defaultGrade = q.getAttribute("defaultgrade") || "0";
            let ddMatchQuestion = new MatchingQuestion(name, text, generalFeedback, defaultGrade);
            let subquestions = q.querySelectorAll("subquestion");
            subquestions.forEach(sq => {
                let questionText = sq.querySelector("text").textContent;
                let answerText = sq.querySelectorAll("text")[1].textContent;
                ddMatchQuestion.addPair(questionText, answerText);
            });
            allQuestions.push(ddMatchQuestion);
        });

        buildDataDoc(allQuestions, title);

    };

    reader.onerror = (e) => {
        console.error('Error reading file:', e);
    };
    
    reader.readAsText(file);
}


function buildDataDoc(questions, title="default title") {   
    let allQuestions = []; 
    let allFiles = []; 

    questions.forEach((q, i) => {
        allQuestions.push(q.getBBXMLText());
    });
    
  
    let question_bank = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
    identifier="question_bank00001" title="${title}">
  <testPart identifier="question_bank00001_1" navigationMode="nonlinear" submissionMode="simultaneous">
  <assessmentSection identifier="question_bank00001_1_1" visible="false" title="Section 1">
  `
    allQuestions.forEach((q, i) => {
        question_bank += `<assessmentItemRef identifier="assessmentItem0000${i + 1}" href="assessmentItem0000${i + 1}.xml"/>`
        allFiles.push({name: `assessmentItem0000${i + 1}.xml`, content: q});
    });

    question_bank += `
    </assessmentSection>
    </testPart>
</assessmentTest>
`

    allFiles.push({name: "question_bank00001.xml", content: question_bank});

    let manifest = `<?xml version="1.0" encoding="UTF-8"?>
            <manifest identifier="man00001" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
            xmlns:csm="http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM"
            xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_metadata_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/imscp_v1p2.xsd http://ltsc.ieee.org/xsd/LOM imsmd_loose_v1p3.xsd http://www.imsglobal.org/xsd/imsqti_metadata_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_metadata_v2p1.xsd http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0 http://www.imsglobal.org/profile/cc/ccv1p2/ccv1p2_imscsmd_v1p0.xsd">
            <metadata>
                <schema>QTIv2.1</schema>
                <schemaversion>2.0</schemaversion>
            </metadata>
            <organizations/>
            <resources>
            <resource href="question_bank00001.xml" identifier="question_bank00001" type="imsqti_test_xmlv2p1">
                <file href="question_bank00001.xml"/>
    `
    allQuestions.forEach((q, i) => {
        manifest += `<dependency identifierref="assessmentItem0000${i + 1}.xml"/>`
    });

    manifest += `</resource>`

    allFiles.forEach(f => {
        if(f.name !== "question_bank00001.xml") {
            manifest += `
                <resource href="${f.name}" identifier="${f.name}" type="imsqti_item_xmlv2p1">
                    <file href="${f.name}"/>
                </resource>
            `
        }
    });

    manifest += `
            </resources>
        </manifest>
    `

    allFiles.push({name: "imsmanifest.xml", content: manifest});
    //downloadTextFile(result, "res00001.dat");
    downloadZipWithTextFiles(allFiles, `question_pool_${title}.zip`);
}




async function downloadZipWithTextFiles(files, zipFilename) {
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Add each file to the zip
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  // Generate the zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download it
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
