/**
 * @enum
 * @description The enum for the log levels.
 */
export var LogLevel;
(function (LogLevel) {
  LogLevel[(LogLevel['Debug'] = 0)] = 'Debug';
  LogLevel[(LogLevel['Info'] = 1)] = 'Info';
  LogLevel[(LogLevel['Warning'] = 2)] = 'Warning';
  LogLevel[(LogLevel['Error'] = 3)] = 'Error';
})(LogLevel || (LogLevel = {}));
/**
 * @enum
 * @description The enum for the sdk error codes.
 */
export var ErrorCode;
(function (ErrorCode) {
  ErrorCode['InvalidInitOptions'] = 'invalid_initialization_options';
  ErrorCode['NotInitialized'] = 'not_initialized';
  ErrorCode['NoActiveJourney'] = 'no_active_journey';
  ErrorCode['NetworkError'] = 'network_error';
  ErrorCode['ClientResponseNotValid'] = 'client_response_not_valid';
  ErrorCode['ServerError'] = 'server_error';
  ErrorCode['InvalidState'] = 'invalid_state';
  ErrorCode['InvalidCredentials'] = 'invalid_credentials';
  ErrorCode['ExpiredOTPPasscode'] = 'expired_otp_passcode';
  ErrorCode['ExpiredValidationPasscode'] = 'expired_validation_passcode';
  ErrorCode['MaxResendReached'] = 'expired_otp_passcode';
})(ErrorCode || (ErrorCode = {}));
/**
 * @enum
 * @description The enum for the client response option types.
 */
export var ClientResponseOptionType;
(function (ClientResponseOptionType) {
  ClientResponseOptionType['ClientInput'] = 'client_input';
  ClientResponseOptionType['Cancel'] = 'cancel';
  ClientResponseOptionType['Fail'] = 'failure';
  ClientResponseOptionType['Custom'] = 'custom';
  ClientResponseOptionType['Resend'] = 'resend';
})(ClientResponseOptionType || (ClientResponseOptionType = {}));
/**
 * @enum
 * @description The enum for the Journey step ID, used when the journey step is a predefined typed action.
 * The actions that do not use this are "Get Information from Client" and "Login Form" which allow the journey author to define a custom ID.
 * See also {@link IdoServiceResponse.journeyStepId}.
 */
export var IdoJourneyActionType;
(function (IdoJourneyActionType) {
  /**
   * @description `journeyStepId` for a journey rejection.
   */
  IdoJourneyActionType['Rejection'] = 'action:rejection';
  /**
   * @description `journeyStepId` for a journey completion.
   */
  IdoJourneyActionType['Success'] = 'action:success';
  /**
   * @description `journeyStepId` for an Information action.
   */
  IdoJourneyActionType['Information'] = 'action:information';
  /**
   * @description `journeyStepId` for a server side debugger breakpoint.
   */
  IdoJourneyActionType['DebugBreak'] = 'action:debug_break';
  /**
   * @description `journeyStepId` for a Wait for Cross Session Message action.
   */
  IdoJourneyActionType['WaitForAnotherDevice'] = 'action:wait_for_another_device';
  /**
   * @description `journeyStepId` for WebAuthn Registration action.
   */
  IdoJourneyActionType['WebAuthnRegistration'] = 'action:webauthn_registration';
  /**
   * @description `journeyStepId` for instructing the use of DRS trigger action, as part of the Risk Recommendation journey step.
   */
  IdoJourneyActionType['DrsTriggerAction'] = 'action:drs_trigger_action';
  /**
   * @description `journeyStepId` for Identity Verification action.
   */
  IdoJourneyActionType['IdentityVerification'] = 'action:id_verification';
  /**
   * @description `journeyStepId` for Email OTP authentication action.
   */
  IdoJourneyActionType['EmailOTPAuthentication'] = 'transmit_platform_email_otp_authentication';
  /**
   * @description `journeyStepId` for SMS OTP authentication action.
   */
  IdoJourneyActionType['SmsOTPAuthentication'] = 'transmit_platform_sms_otp_authentication';
  /**
   * @description `journeyStepId` for TOTP Registration action.
   */
  IdoJourneyActionType['TotpRegistration'] = 'transmit_platform_totp_registration';
  /**
   * @description `journeyStepId` for Email Validation action.
   */
  IdoJourneyActionType['EmailValidation'] = 'transmit_platform_email_validation';
  /**
   * @description `journeyStepId` for Sms Validation action.
   */
  IdoJourneyActionType['SmsValidation'] = 'transmit_platform_sms_validation';
  /**
   * @description `journeyStepId` for Invoke IDP action.
   */
  IdoJourneyActionType['InvokeIDP'] = 'invoke_idp';
})(IdoJourneyActionType || (IdoJourneyActionType = {}));
