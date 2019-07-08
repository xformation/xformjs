var PERSONAL = {
    title: "Personal Details",
    showQuestionNumbers: "off",
    elements: [
        {
            type: "text",
            name: "name",
            title: "First Name",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        },
        {
            type: "text",
            name: "entity",
            title: "Last Name",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        }
    ]
}; 
var ADDRESS = {
    title: "Contact Details",
    showQuestionNumbers: "off",
    elements: [
        {
            type: "text",
            name: "address1",
            title: "Address One",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        },
        {
            type: "text",
            name: "address2",
            title: "Address Two",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        },
        {
            type: "text",
            name: "address3",
            title: "Address Three",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        }
    ]
};
var EDUCATION = {
    title: "Emergency Contact Details",
    showQuestionNumbers: "off",
    elements: [
        {
            type: "text",
            name: "name",
            title: "Name",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        },
        {
            type: "text",
            name: "middle_name",
            title: "Middle Name",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        },
        {
            type: "text",
            name: "last_name",
            title: "Last Name",
            isRequired: true,
            maxLength: 50,
            startWithNewLine: false
        }
    ]
};

function init() {
    // var model = new xform.Model(PERSONAL);
    // window.survey = model;
    ReactDOM.render(
        <table width="100%">
            <tbody>
                <tr>
                    <td style={{ width: '30%' }}>
                        <div>
                            <img src="" width="150" height="250" alt="Temp" />
                        </div>
                    </td>
                    <td style={{ width: '70%' }}>
                        <div>
                            <xform.SurveyCollapseForm json={PERSONAL} />
                        </div>
                        <div>
                            <xform.SurveyCollapseForm json={ADDRESS} />
                        </div>
                        <div>
                            <xform.SurveyCollapseForm json={EDUCATION} />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">
                    </td>
                </tr>
            </tbody>
        </table>
        , document.getElementById("surveyElement"));

}

if (!window["%hammerhead%"]) {
    init();
}
