import { IdoJourneyActionType, ClientResponseOptionType } from './transmit-ido-sdk_interface.js';

export const newOrchestrationController = (handlers) => {
  return new OrchestrationController(handlers);
};

class OrchestrationController {
  handlerWrapper(idoServiceResponse, handle) {
    console.group('🐙 STEP: ', idoServiceResponse.journeyStepId);
    console.log(idoServiceResponse);
    handle.call(this, idoServiceResponse);
    console.groupEnd();
  }

  defaultHandleJourneyStep(idoServiceResponse) {
    console.log('🙀🙀🙀🙀 Unhandled journey step', idoServiceResponse.journeyStepId);
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
  }) {
    this.handleStepSuccess = (idoResponse) => this.handlerWrapper(idoResponse, handleStepSuccess);
    this.handleStepRejection = (idoResponse) => this.handlerWrapper(idoResponse, handleStepRejection);
    this.handleStepInformation = (idoResponse) => this.handlerWrapper(idoResponse, handleStepInformation);
    this.handleStepEmailOTP = (idoResponse) => this.handlerWrapper(idoResponse, handleStepEmailOTP);
    this.handleStepRiskRecommendation = (idoResponse) => this.handlerWrapper(idoResponse, handleStepRiskRecommendation);
  }

  async startJourney(journeyId, additionalJourneyParams = {}) {
    console.log(`Start journey: ${journeyId}`);
    try {
      const idoServiceResponse = await window.tsPlatform.ido.startJourney(journeyId, {
        additionalParams: additionalJourneyParams,
      });
      this.journeyStepsRunner(idoServiceResponse);
    } catch (error) {
      console.log('startJourney failed:', error);
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
      default:
        console.error('Unhandled journey step:', idoServiceResponse.journeyStepId);
        console.error('Step:', idoServiceResponse);
        break;
    }
  }

  async submitResponse(clientResponseOptionType = ClientResponseOptionType.ClientInput, data = {}) {
    const idoResponse = await window.tsPlatform.ido.submitClientResponse(clientResponseOptionType, data);
    this.journeyStepsRunner(idoResponse);
  }
  async submitResponseEmailOTP(passcode) {
    this.submitResponse(ClientResponseOptionType.EmailOTP, { passcode: passcode });
  }
}
