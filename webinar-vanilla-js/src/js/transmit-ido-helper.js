import { IdoJourneyActionType, ClientResponseOptionType } from './transmit-ido-sdk_interface.js';

export const newOrchestrationController = (handlers) => {
  return new OrchestrationController(handlers);
};

const CONSOLE_STYLES = {
  title: 'color: palevioletred; font-weight: bold; font-size: 1.3em;',
  //success: 'color: green; font-weight: bold;',
  error: 'color: red; font-weight: bold;',
  warning: 'color: orange; font-weight: bold;',
  //info: 'color: lightskyblue; font-weight: bold;',
};

class OrchestrationController {
  handlerWrapper(idoServiceResponse, handle) {
    let stepTitle;
    if (idoServiceResponse.journeyStepId === IdoJourneyActionType.Information) {
      stepTitle = 'Info: ' + idoServiceResponse.data.text;
    } else {
      stepTitle = idoServiceResponse.journeyStepId;
    }
    console.groupCollapsed(`%c🐙 STEP: ${stepTitle}`, CONSOLE_STYLES.title);
    console.log(JSON.stringify(idoServiceResponse, null, 2));
    console.time('stepTime');
    handle.call(this, idoServiceResponse);
    console.timeEnd('stepTime');
    console.groupEnd();
  }

  defaultHandleJourneyStep(idoServiceResponse) {
    console.warn(`%c🙀🙀🙀🙀 Unhandled journey step: ${idoServiceResponse.journeyStepId}`, CONSOLE_STYLES.warning);
  }

  // eslint-disable-next-line no-unused-vars
  defaultHandleInformationStep(_idoServiceResponse) {
    this.submitResponse();
  }

  async defaultHandleRiskRecommendations(idoResponse) {
    const correlationId = idoResponse.data.correlation_id;
    const claimedUserId = idoResponse.data.user_id;
    const actionType = idoResponse.data.action_type;

    // Triggers an action event using the DRS SDK
    const { actionToken } = await window.tsPlatform.drs.triggerActionEvent(actionType, {
      correlationId,
      claimedUserId,
    });

    const data = { action_token: actionToken };

    // Submits an action token to the journey using the IDO SDK
    this.submitResponse(ClientResponseOptionType.ClientInput, data);
  }

  setHandlers({
    handleStepSuccess = handleStepSuccess || this.defaultHandleJourneyStep,
    handleStepRejection = handleStepRejection || this.defaultHandleJourneyStep,
    handleStepInformation = this.defaultHandleInformationStep,
    handleStepEmailOTP = this.defaultHandleJourneyStep,
    handleStepRiskRecommendation = this.defaultHandleRiskRecommendations,
    handleStepPasskeysRegistration = this.defaultHandleJourneyStep,
    handleStepPromotePasskeys = this.defaultHandleJourneyStep,
    handleStepChooseStepUp = this.defaultHandleJourneyStep,
  }) {
    this.handleStepSuccess = (idoResponse) => this.handlerWrapper(idoResponse, handleStepSuccess);
    this.handleStepRejection = (idoResponse) => this.handlerWrapper(idoResponse, handleStepRejection);
    this.handleStepInformation = (idoResponse) => this.handlerWrapper(idoResponse, handleStepInformation);
    this.handleStepEmailOTP = (idoResponse) => this.handlerWrapper(idoResponse, handleStepEmailOTP);
    this.handleStepRiskRecommendation = (idoResponse) => this.handlerWrapper(idoResponse, handleStepRiskRecommendation);
    this.handleStepPasskeysRegistration = (idoResponse) =>
      this.handlerWrapper(idoResponse, handleStepPasskeysRegistration);
    this.handleStepPromotePasskeys = (idoResponse) => this.handlerWrapper(idoResponse, handleStepPromotePasskeys);
    this.handleStepChooseStepUp = (idoResponse) => this.handlerWrapper(idoResponse, handleStepChooseStepUp);
  }

  async startJourney(journeyId, additionalJourneyParams = {}) {
    console.info(`%c🚀🚀 START JOURNEY: ${journeyId} 🚀🚀`, CONSOLE_STYLES.title);
    try {
      const idoServiceResponse = await window.tsPlatform.ido.startJourney(journeyId, {
        additionalParams: additionalJourneyParams,
      });
      this.journeyStepsRunner(idoServiceResponse);
    } catch (error) {
      console.error(`%cstartJourney failed: ${JSON.stringify(error, null, 2)}`, CONSOLE_STYLES.error);
    }
  }

  journeyStepsRunner(idoServiceResponse) {
    switch (idoServiceResponse.journeyStepId) {
      case IdoJourneyActionType.Success:
        this.handleStepSuccess(idoServiceResponse);
        break;
      case IdoJourneyActionType.Rejection:
        this.handleStepRejection(idoServiceResponse);
        break;
      case IdoJourneyActionType.Information:
        this.handleStepInformation(idoServiceResponse);
        break;
      case IdoJourneyActionType.EmailOTPAuthentication:
        this.handleStepEmailOTP(idoServiceResponse);
        break;
      case IdoJourneyActionType.DrsTriggerAction:
        this.handleStepRiskRecommendation(idoServiceResponse);
        break;
      case IdoJourneyActionType.WebAuthnRegistration:
        this.handleStepPasskeysRegistration(idoServiceResponse);
        break;
      case 'promote_passkeys':
        this.handleStepPromotePasskeys(idoServiceResponse);
        break;
      case 'choose_step_up':
        this.handleStepChooseStepUp(idoServiceResponse);
        break;
      default:
        this.defaultHandleJourneyStep(idoServiceResponse);
        break;
    }
  }

  async submitResponse(clientResponseOptionType = ClientResponseOptionType.ClientInput, data = {}) {
    const idoResponse = await window.tsPlatform.ido.submitClientResponse(clientResponseOptionType, data);
    this.journeyStepsRunner(idoResponse);
  }
  async submitResponseForm(data) {
    this.submitResponse(ClientResponseOptionType.ClientInput, data);
  }
  async cancelResponseForm() {
    this.submitResponse(ClientResponseOptionType.Cancel);
  }
  async submitResponseEmailOTP(passcode) {
    this.submitResponse(ClientResponseOptionType.EmailOTP, { passcode: passcode });
  }
  async submitResponseCancel() {
    this.submitResponse(ClientResponseOptionType.Cancel);
  }
}
