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

const leftCss = {
    root: "form-container",
    header: "form-header",
    footer: "panel-footer card-footer text-right",
    body: "form-body-left",
    question: {
        title: "gf-form-label width-8 m-0",
        mainRoot: "gf-form",
    },
    text: "gf-form-input max-width-22",
    dropdown: {
        control: "gf-form-input max-width-22",
    },
    navigation: {
        complete: "btn bs"
    },
    error: {
        root: "error"
    }
};

const rightCss = {
    root: "form-container",
    header: "form-header",
    headerNoError: "no-error",
    headerError: "error",
    footer: "panel-footer card-footer text-right",
    body: "form-body-right",
    question: {
        title: "form-control-label",
        mainRoot: "form-control-container sv_qstn"
    },
    text: "input-form-control",
    dropdown: {
        control: "select-form-control",
    },
    navigation: {
        complete: "btn bs"
    },
    error: {
        root: "error"
    }
};

function init() {
    // var model = new xform.Model(PERSONAL);
    // window.survey = model;
    let { SurveyCollapseForm } = xform;
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
                            <SurveyCollapseForm json={PERSONAL} css={leftCss} />
                        </div>
                        <div>
                            <SurveyCollapseForm json={ADDRESS} css={rightCss} />
                        </div>
                        <div>
                            <SurveyCollapseForm json={EDUCATION} />
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
