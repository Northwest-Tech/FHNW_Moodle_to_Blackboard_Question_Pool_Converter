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
                this.answers.push({'text': text, 'fraction': fraction});
            }

            getBBXMLText() {
                //TODO Fix tha answers portion of this. 

                let result = ` 
                  <item maxattempts="0" title="${this.name}">
                    <itemmetadata>
                    <bbmd_asitype>Item</bbmd_asitype>
                    <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
                    <bbmd_sectiontype>Subsection</bbmd_sectiontype>
                    <bbmd_questiontype>Multiple Choice</bbmd_questiontype>
                    <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
                    <bbmd_is_disabled>false</bbmd_is_disabled>
                    <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
                    <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
                    <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
                    <bbmd_numbertype>none</bbmd_numbertype>
                    <bbmd_partialcredit>false</bbmd_partialcredit>
                    <bbmd_orientationtype>vertical</bbmd_orientationtype>
                    <bbmd_is_extracredit>false</bbmd_is_extracredit>
                    <qmd_absolutescore_max>1.0</qmd_absolutescore_max>
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
                    <response_lid ident="response" rcardinality="Single" rtiming="No">
                    <render_choice maxnumber="0" minnumber="0" shuffle="Yes">
                    <flow_label class="Block">
                    <response_label ident="a" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="a"><div> <p>Not Correct</p> </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    <flow_label class="Block">
                    <response_label ident="b" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="b"><div> <p>Correct</p> </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    <flow_label class="Block">
                    <response_label ident="c" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="c"><div> <p>Not Correct either</p> </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    <flow_label class="Block">
                    <response_label ident="d" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="d"><div> <p>Still not correct</p> </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    </render_choice>
                    </response_lid>
                    </flow>
                    </flow>
                    </presentation>
                    <resprocessing scoremodel="SumOfScores">
                    <outcomes>
                    <decvar defaultval="0" maxvalue="1.0" minvalue="0" varname="SCORE" vartype="Decimal"/>
                    </outcomes>
                    <respcondition title="correct">
                    <conditionvar>
                    <varequal case="No" respident="response">b</varequal>
                    </conditionvar>
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
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="a"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">0</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="a"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="b"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">100</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="b"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="c"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">0</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="c"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="d"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">0</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="d"/>
                    </respcondition>
                    </resprocessing>
                    <itemfeedback ident="correct" view="All">
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div> <p>Your answer is correct.</p> </div></div></mat_formattedtext>
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
                    <mat_formattedtext type="HTML"><div><div> <p>Your answer is incorrect.</p> </div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </itemfeedback>
                    <itemfeedback ident="a" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    <itemfeedback ident="b" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    <itemfeedback ident="c" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    <itemfeedback ident="d" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    </item>
                `

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
                let result =  `
                <item maxattempts="0" title="${this.name}">
                    <itemmetadata>
                    <bbmd_asitype>Item</bbmd_asitype>
                    <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
                    <bbmd_sectiontype>Subsection</bbmd_sectiontype>
                    <bbmd_questiontype>Fill in the Blank</bbmd_questiontype>
                    <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
                    <bbmd_is_disabled>false</bbmd_is_disabled>
                    <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
                    <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
                    <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
                    <bbmd_numbertype>none</bbmd_numbertype>
                    <bbmd_partialcredit>false</bbmd_partialcredit>
                    <bbmd_orientationtype>vertical</bbmd_orientationtype>
                    <bbmd_is_extracredit>false</bbmd_is_extracredit>
                    <qmd_absolutescore_max>1.0</qmd_absolutescore_max>
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
                    <render_fib charset="us-ascii" columns="127" encoding="UTF_8" fibtype="String" maxchars="0" maxnumber="0" minnumber="0" prompt="Box" rows="1"/>
                    </response_str>
                    </flow>
                    </flow>
                    </presentation>
                    <resprocessing scoremodel="SumOfScores">
                    <outcomes>
                    <decvar defaultval="0" maxvalue="1.0" minvalue="0" varname="SCORE" vartype="Decimal"/>
                    </outcomes>
                    `

                    //TODO Verify this logic 
                    this.answers.forEach((ans, index) => {
                        if (ans.fraction > 0) {
                            result += `
                            <respcondition title="correct${index}">
                            <conditionvar>
                            <varequal case="No" respident="response">${ans.text}</varequal>
                            </conditionvar>
                            <setvar action="Set" variablename="SCORE">${(ans.fraction/100) * this.defaultGrade}</setvar>
                            <displayfeedback feedbacktype="Response" linkrefid="correct"/>
                            </respcondition>
                            `
                        } else {
                            result += `
                            <respcondition title="incorrect${index}">
                            <conditionvar>
                            <varequal case="No" respident="response">${ans.text}</varequal>
                            </conditionvar>
                            <setvar action="Set" variablename="SCORE">0</setvar>
                            <displayfeedback feedbacktype="Response" linkrefid="incorrect"/>
                            </respcondition>
                            `
                        }
                    });

                    // <respcondition title="GL124LEB">
                    // <conditionvar>
                    // <varequal case="No" respident="response">CORrect</varequal>
                    // </conditionvar>
                    // <displayfeedback feedbacktype="Response" linkrefid="correct"/>
                    // <displayfeedback feedbacktype="Response" linkrefid="GL124LEB"/>
                    // </respcondition>
                    // <respcondition title="incorrect">
                    // <conditionvar>
                    // <other/>
                    // </conditionvar>
                    // <setvar action="Set" variablename="SCORE">0</setvar>
                    // <displayfeedback feedbacktype="Response" linkrefid="incorrect"/>
                    // </respcondition>

                    result += `
                    </resprocessing>
                    <itemfeedback ident="correct" view="All">
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
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
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </itemfeedback>
                    <itemfeedback ident="GL124LEB" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    </item>
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
                this.answers = []; // array of {text: "", fraction: 100 or 0}
            }

            addAnswer(text, fraction) {
                this.answers.push({"text":text, "fraction":fraction});
            }

            getBBXMLText() {
                //TODO: Fix the answers portion of this.
                let result = `
                <item maxattempts="0" title="${this.name}">
                    <itemmetadata>
                    <bbmd_asitype>Item</bbmd_asitype>
                    <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
                    <bbmd_sectiontype>Subsection</bbmd_sectiontype>
                    <bbmd_questiontype>Multiple Choice</bbmd_questiontype>
                    <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
                    <bbmd_is_disabled>false</bbmd_is_disabled>
                    <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
                    <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
                    <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
                    <bbmd_numbertype>none</bbmd_numbertype>
                    <bbmd_partialcredit>false</bbmd_partialcredit>
                    <bbmd_orientationtype>vertical</bbmd_orientationtype>
                    <bbmd_is_extracredit>false</bbmd_is_extracredit>
                    <qmd_absolutescore_max>1.0</qmd_absolutescore_max>
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
                    <response_lid ident="response" rcardinality="Single" rtiming="No">
                    <render_choice maxnumber="0" minnumber="0" shuffle="Yes">
                    <flow_label class="Block">
                    <response_label ident="a" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="a"><div> true </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    <flow_label class="Block">
                    <response_label ident="b" rarea="Ellipse" rrange="Exact" shuffle="Yes">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><simpleChoice identifier="b"><div> false </div></simpleChoice></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </response_label>
                    </flow_label>
                    </render_choice>
                    </response_lid>
                    </flow>
                    </flow>
                    </presentation>
                    <resprocessing scoremodel="SumOfScores">
                    <outcomes>
                    <decvar defaultval="0" maxvalue="1.0" minvalue="0" varname="SCORE" vartype="Decimal"/>
                    </outcomes>
                    <respcondition title="correct">
                    <conditionvar>
                    <varequal case="No" respident="response">a</varequal>
                    </conditionvar>
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
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="a"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">100</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="a"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="b"/>
                    </conditionvar>
                    <setvar action="Set" variablename="SCORE">0</setvar>
                    <displayfeedback feedbacktype="Response" linkrefid="b"/>
                    </respcondition>
                    </resprocessing>
                    <itemfeedback ident="correct" view="All">
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div> <div> <p>Yes, you can convert to Blackboard</p> </div> </div></div></mat_formattedtext>
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
                    <mat_formattedtext type="HTML"><div><div> <div> <p>The false answer is incorrect. </p> </div> </div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </itemfeedback>
                    <itemfeedback ident="a" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    <itemfeedback ident="b" view="All">
                    <solution feedbackstyle="Complete" view="All">
                    <solutionmaterial>
                    <flow_mat class="Block">
                    <flow_mat class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"/>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </solutionmaterial>
                    </solution>
                    </itemfeedback>
                    </item>
                `
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
                <item maxattempts="0" title="${this.name}">
                    <itemmetadata>
                    <bbmd_asitype>Item</bbmd_asitype>
                    <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
                    <bbmd_sectiontype>Subsection</bbmd_sectiontype>
                    <bbmd_questiontype>Matching</bbmd_questiontype>
                    <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
                    <bbmd_is_disabled>false</bbmd_is_disabled>
                    <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
                    <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
                    <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
                    <bbmd_numbertype>none</bbmd_numbertype>
                    <bbmd_partialcredit>true</bbmd_partialcredit>
                    <bbmd_orientationtype>vertical</bbmd_orientationtype>
                    <bbmd_is_extracredit>false</bbmd_is_extracredit>
                    <qmd_absolutescore_max>1.0</qmd_absolutescore_max>
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
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> <p>Item 1</p> </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    <response_lid ident="RU2ML03X" rcardinality="Single" rtiming="No">
                    <render_choice maxnumber="0" minnumber="0" shuffle="No">
                    <flow_label class="Block">
                    <response_label ident="WZXFN4XD" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="B5SOVOE2" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="RECXEL8N" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    </flow_label>
                    </render_choice>
                    </response_lid>
                    </flow>
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> <p>Item 2</p> </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    <response_lid ident="WL5180UN" rcardinality="Single" rtiming="No">
                    <render_choice maxnumber="0" minnumber="0" shuffle="No">
                    <flow_label class="Block">
                    <response_label ident="TV0PJKFT" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="RTODM68K" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="RSTOLH6T" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    </flow_label>
                    </render_choice>
                    </response_lid>
                    </flow>
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> <p>Item 3</p> </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    <response_lid ident="USJMKQ8T" rcardinality="Single" rtiming="No">
                    <render_choice maxnumber="0" minnumber="0" shuffle="No">
                    <flow_label class="Block">
                    <response_label ident="II5M2JXJ" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="ZPGZ2URE" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    <response_label ident="QJC5DFZG" rarea="Ellipse" rrange="Exact" shuffle="Yes"/>
                    </flow_label>
                    </render_choice>
                    </response_lid>
                    </flow>
                    </flow>
                    <flow class="RIGHT_MATCH_BLOCK">
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> Answer 1 </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    </flow>
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> Answer 2 </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    </flow>
                    <flow class="Block">
                    <flow class="FORMATTED_TEXT_BLOCK">
                    <material>
                    <mat_extension>
                    <mat_formattedtext type="HTML"><div><div><div> Answer 3 </div></div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow>
                    </flow>
                    </flow>
                    </flow>
                    </presentation>
                    <resprocessing scoremodel="SumOfScores">
                    <outcomes>
                    <decvar defaultval="0" maxvalue="1.0" minvalue="0" varname="SCORE" vartype="Decimal"/>
                    </outcomes>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="RU2ML03X">WZXFN4XD</varequal>
                    </conditionvar>
                    <displayfeedback feedbacktype="Response" linkrefid="correct"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="WL5180UN">RTODM68K</varequal>
                    </conditionvar>
                    <displayfeedback feedbacktype="Response" linkrefid="correct"/>
                    </respcondition>
                    <respcondition>
                    <conditionvar>
                    <varequal case="No" respident="USJMKQ8T">QJC5DFZG</varequal>
                    </conditionvar>
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
                    <mat_formattedtext type="HTML"><div><div> <p>Your answer is correct.</p> </div></div></mat_formattedtext>
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
                    <mat_formattedtext type="HTML"><div><div> <p>Your answer is incorrect.</p> </div></div></mat_formattedtext>
                    </mat_extension>
                    </material>
                    </flow_mat>
                    </flow_mat>
                    </itemfeedback>
                    </item> 
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
                        let fraction = parseFloat(a.getAttribute("fraction")) || 0;
                        tfQuestion.addAnswer(answerText, fraction);
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

                console.log(allQuestions);

            };
    
            reader.onerror = (e) => {
                console.error('Error reading file:', e);
            };
            
            reader.readAsText(file);
        }