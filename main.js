const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

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

        var allQuestions = [];

        class EssayQuestion{
            constructor(name, text, generalFeedback, defaultGrade) {
                this.name = name;
                this.text = text;
                this.generalFeedback = generalFeedback;
                this.defaultGrade = defaultGrade;
            }

            getBBXMLText() {
                return `
                <item maxattempts="0" title="${this.name}">
                <itemmetadata>
                <bbmd_asitype>Item</bbmd_asitype>
                <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
                <bbmd_sectiontype>Subsection</bbmd_sectiontype>
                <bbmd_questiontype>Essay</bbmd_questiontype>
                <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
                <bbmd_is_disabled>false</bbmd_is_disabled>
                <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
                <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
                <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
                <bbmd_numbertype>none</bbmd_numbertype>
                <bbmd_partialcredit>false</bbmd_partialcredit>
                <bbmd_orientationtype>vertical</bbmd_orientationtype>
                <bbmd_is_extracredit>false</bbmd_is_extracredit>
                <qmd_absolutescore_max>${this.defaultGrade}</qmd_absolutescore_max>
                <qmd_weighting>0</qmd_weighting>
                </itemmetadata>
                <presentation>
                <flow class="Block">
                <flow class="QUESTION_BLOCK">
                <flow class="FORMATTED_TEXT_BLOCK">
                <material>
                <mat_extension>
                <mat_formattedtext type="HTML"><prompt><div> ${this.text} </div></prompt></mat_formattedtext>
                </mat_extension>
                </material>
                </flow>
                </flow>
                <flow class="RESPONSE_BLOCK">
                <response_str ident="response" rcardinality="Single" rtiming="No">
                <render_fib charset="us-ascii" columns="127" encoding="UTF_8" fibtype="String" maxchars="0" maxnumber="0" minnumber="0" prompt="Box" rows="8"/>
                </response_str>
                </flow>
                </flow>
                </presentation>
                <resprocessing scoremodel="SumOfScores">
                <outcomes>
                <decvar defaultval="0" maxvalue="${this.defaultGrade}" minvalue="0" varname="SCORE" vartype="Decimal"/>
                </outcomes>
                <respcondition title="correct">
                <conditionvar/>
                <setvar action="Set" variablename="SCORE">SCORE.max</setvar>
                <displayfeedback feedbacktype="Response" linkrefid="correct"/>
                </respcondition>
                <respcondition title="incorrect">
                <conditionvar>
                <other/>
                </conditionvar>
                <setvar action="Set" variablename="SCORE">0</setvar>
                <displayfeedback feedbacktype="Response" linkrefid="incorrect"/>
                </respcondition>
                </resprocessing>
                <itemfeedback ident="correct" view="All">
                <flow_mat class="Block">
                <flow_mat class="FORMATTED_TEXT_BLOCK">
                <material>
                <mat_extension>
                <mat_formattedtext type="HTML"><div><div> ${this.generalFeedback} </div></div></mat_formattedtext>
                </mat_extension>
                </material>
                </flow_mat>
                </flow_mat>
                </itemfeedback>
                <itemfeedback ident="incorrect" view="All">
                <flow_mat class="Block">
                <flow_mat class="FORMATTED_TEXT_BLOCK">
                <material>
                <mat_extension>
                <mat_formattedtext type="HTML"><div><div> <p>General Feedback for Essay Question </p> </div></div></mat_formattedtext>
                </mat_extension>
                </material>
                </flow_mat>
                </flow_mat>
                </itemfeedback>
                <itemfeedback ident="solution" view="All">
                <solution feedbackstyle="Complete" view="All">
                <solutionmaterial>
                <flow_mat class="Block">
                <material>
                <mat_extension>
                <mat_formattedtext type="HTML"/>
                </mat_extension>
                </material>
                </flow_mat>
                </solutionmaterial>
                </solution>
                </itemfeedback>
                </item>
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
                this.answers.push({"text":text, "fraction":fraction});
            }

            getBBXMLText() {
                let beginning = ` 
                  Todo add stuff 
                `
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
                return `
                TODO 
                `
            }
        }


        function readTextFile(file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const contents = e.target.result;
                console.log('File contents:');
                // Work with my XML data here

                const parser = new DOMParser().parseFromString(contents, "text/xml");

                let questions = parser.querySelectorAll("question");
                console.log(questions.length);
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

                console.log(allQuestions);

            };
    
            reader.onerror = (e) => {
                console.error('Error reading file:', e);
            };
            
            reader.readAsText(file);
        }