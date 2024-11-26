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
  /**
   * @description The init options object is invalid.
   */
  ErrorCode['InvalidInitOptions'] = 'invalid_initialization_options';
  /**
   * @description The sdk is not initialized.
   */
  ErrorCode['NotInitialized'] = 'not_initialized';
  /**
   * @description There is no active Journey.
   */
  ErrorCode['NoActiveJourney'] = 'no_active_journey';
  /**
   * @description Unable to receive response from the server.
   */
  ErrorCode['NetworkError'] = 'network_error';
  /**
   * @description The client response to the Journey is not valid.
   */
  ErrorCode['ClientResponseNotValid'] = 'client_response_not_valid';
  /**
   * @description The server returned an unexpected error.
   */
  ErrorCode['ServerError'] = 'server_error';
  /**
   * @description The provided state is not valid for SDK state recovery.
   */
  ErrorCode['InvalidState'] = 'invalid_state';
  /**
   * @description The provided credentials are invalid.
   */
  ErrorCode['InvalidCredentials'] = 'invalid_credentials';
  /**
   * @description The provided OTP passcode is expired.
   */
  ErrorCode['ExpiredOTPPasscode'] = 'expired_otp_passcode';
  /**
   * @description The provided validation passcode is expired.
   */
  ErrorCode['ExpiredValidationPasscode'] = 'expired_validation_passcode';
  /**
   * @description Max resend attempts reached
   */
  ErrorCode['MaxResendReached'] = 'expired_otp_passcode';
})(ErrorCode || (ErrorCode = {}));
/**
 * @enum
 * @description The enum for the client response option types.
 */
export var ClientResponseOptionType;
(function (ClientResponseOptionType) {
  /**
   * @description Client response option type for client input. This is the standard response option for any step.
   */
  ClientResponseOptionType['ClientInput'] = 'client_input';
  /**
   * @description Client response option type for a cancelation branch in the Journey. Use this for canceling the current step.
   */
  ClientResponseOptionType['Cancel'] = 'cancel';
  /**
   * @description Client response option type for a failure branch in the Journey. Use this for reporting client side failure for the current step.
   */
  ClientResponseOptionType['Fail'] = 'failure';
  /**
   * @description Client response option type for custom branch in the Journey, used for custom branching.
   */
  ClientResponseOptionType['Custom'] = 'custom';
  /**
   * @description Client response option type for a resend of the OTP. Use this for restarting the current step (sms / email otp authentication).
   */
  ClientResponseOptionType['Resend'] = 'resend';
})(ClientResponseOptionType || (ClientResponseOptionType = {}));
/**
 * @deprecated
 * @enum
 * @description Deprecated enum. Use {@link IdoJourneyActionType} instead to detect completion, rejection, or a step that requires client input.
 */
export var IdoServiceResponseType;
(function (IdoServiceResponseType) {
  /**
   * @description The Journey ended successfully.
   */
  IdoServiceResponseType['JourneySuccess'] = 'journey_success';
  /**
   * @description The Journey reached a step that requires client input.
   */
  IdoServiceResponseType['ClientInputRequired'] = 'client_input_required';
  /**
   * @description The current Journey step updated the client data or provided an error message.
   */
  IdoServiceResponseType['ClientInputUpdateRequired'] = 'client_input_update_required';
  /**
   * @description The Journey ended with explicit rejection.
   */
  IdoServiceResponseType['JourneyRejection'] = 'journey_rejection';
})(IdoServiceResponseType || (IdoServiceResponseType = {}));
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
   *
   * Data received in the {@link IdoServiceResponse} object:
   * These are the text values that are configured for the Information action step in the journey editor.
   * This can be used to display the information to the user.
   * ```json
   * {
   *  "data": {
   *    "title": "<TITLE>",
   *    "text": "<TEXT>",
   *    "button_text": "<BUTTON TEXT>"
   *  }
   * }
   * ```
   * The client response does not need to include any data: `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.ClientInput);`
   */
  IdoJourneyActionType['Information'] = 'action:information';
  /**
   * @description `journeyStepId` for a server side debugger breakpoint.
   * This response is sent to the client side when the journey debugger has reached a breakpoint, and will continue to return while
   * the journey debugger is paused.
   *
   * The {@link IdoServiceResponse} object does not include any data.
   *
   * The client response does not need to include any data: `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.ClientInput);`
   */
  IdoJourneyActionType['DebugBreak'] = 'action:debug_break';
  /**
   * @description `journeyStepId` for a Wait for Cross Session Message action.
   *
   * The {@link IdoServiceResponse} object includes information that can be presented as a QR to scan by another device.
   * The response will remain the same while the cross session message was not consumed by the journey executed by the other device.
   *
   * The client response does not need to include any data: `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.ClientInput);`
   */
  IdoJourneyActionType['WaitForAnotherDevice'] = 'action:wait_for_another_device';
  /**
   * @hidden
   * @deprecated Use {@link IdoJourneyActionType.RegisterDeviceAction} instead.
   */
  IdoJourneyActionType['CryptoBindingRegistration'] = 'action:crypto_binding_registration';
  /**
   * @hidden
   * @deprecated Use {@link IdoJourneyActionType.ValidateDeviceAction} instead.
   */
  IdoJourneyActionType['CryptoBindingValidation'] = 'action:crypto_binding_validation';
  /**
   * @hidden
   * @description `journeyStepId` for Register Device action.
   * This action is handled automatically by the SDK.
   */
  IdoJourneyActionType['RegisterDeviceAction'] = 'transmit_platform_device_registration';
  /**
   * @hidden
   * @description `journeyStepId` for Validate Device action.
   * This action is handled automatically by the SDK.
   */
  IdoJourneyActionType['ValidateDeviceAction'] = 'transmit_platform_device_validation';
  /**
   * @description `journeyStepId` for WebAuthn Registration action.
   *
   * Data received in the {@link IdoServiceResponse} object: the input parameters that you need to send to `tsPlatform.webauthn.register()`
   * ```json
   * {
   *  "data": {
   *    "username": "<USERNAME>",
   *    "display_name": "<DISPLAY_NAME>",
   *    "register_as_discoverable": <true|false>,
   *    "allow_cross_platform_authenticators": <true|false>
   *  }
   * }
   * ```
   *
   * Before responding, activate `tsPlatform.webauthn.register()` to obtain the `webauthn_encoded_result` value.
   * This will present the user with the WebAuthn registration UI. Use the result to send the client response:
   * ```json
   * tsPlatform.ido.submitClientResponse(
   *     ClientResponseOptionType.ClientInput,
   *     {
   *         "webauthn_encoded_result": "<WEBAUTHN_ENCODED_RESULT_FROM_SDK>"
   *     })
   * ```
   */
  IdoJourneyActionType['WebAuthnRegistration'] = 'action:webauthn_registration';
  /**
   * @description `journeyStepId` for instructing the use of DRS trigger action, as part of the Risk Recommendation journey step.
   *
   * Data received in the {@link IdoServiceResponse} object: the input parameters that you need to send to `tsPlatform.drs.triggerActionEvent()`
   * ```json
   * {
   *  "data": {
   *     "correlation_id": "a47ed80a-41f9-464a-a42f-fce775b6e446",
   *     "user_id": "user",
   *     "action_type": "login"
   *  },
   * }
   * ```
   * Before responding, activate `tsPlatform.drs.triggerActionEvent()` to obtain the `action_token` value. This is a silent action, and does not require user interaction.
   * Use the result to send the client response:
   * ```json
   * tsPlatform.ido.submitClientResponse(
   *     ClientResponseOptionType.ClientInput,
   *     {
   *         "action_token": "<DRS action token>"
   *     })
   * ```
   */
  IdoJourneyActionType['DrsTriggerAction'] = 'action:drs_trigger_action';
  /**
   * @description `journeyStepId` for Identity Verification action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   * ```json
   * {
   *  "data": {
   *    "payload": {
   *      "endpoint": "<endpoint to redirect>",
   *      "base_endpoint": "<base endpoint>",
   *      "start_token": "<start token>",
   *      "state": "<state>",
   *      "session": "<session>"
   *      },
   *    }
   * }
   * ```
   * Use this data to redirect the user to the identity verification endpoint.
   * Since this redirects to a different page, make sure you store the SDK state by calling `tsPlatform.ido.serializeState()`, and saving the response data in the session storage.
   * After the user completes the identity verification, you can restore the SDK state and continue the journey, by calling `tsPlatform.ido.restoreFromSerializedState()` with the stored state.
   *
   * Once done, send the following client response:
   * ```json
   * tsPlatform.ido.submitClientResponse(
   *     ClientResponseOptionType.ClientInput,
   *     {
   *         "payload": {
   *             "sessionId": "<sessionId>",
   *             "state": "<state>"
   *         }
   *     })
   * ```
   */
  IdoJourneyActionType['IdentityVerification'] = 'action:id_verification';
  /**
   * @description `journeyStepId` for Email OTP authentication action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   *
   * ```json
   * {
   *  "data": {
   *    "code_length": <integer_code_length>
   *   }
   * }
   * ```
   *
   * On failure, the `IdoServiceResponse` {@link IdoServiceResponse.errorData} field will contain either the error code {@link ErrorCode.InvalidCredentials} or the error code {@link ErrorCode.ExpiredOTPPasscode}.
   *
   * This can be used to indicate that the passcode is invalid, prompting the user to enter a new passcode.
   * Also, a resend option (see below) can be provided to the user.
   *
   * Client responses:
   *
   * - For simple submit of OTP passcode:
   * ```json
   *      tsPlatform.ido.submitClientResponse(
   *          ClientResponseOptionType.ClientInput,
   *          {
   *              "passcode": "<passcode>"
   *          })
   * ```
   *
   * - In Order to request resend of OTP (restart the action):
   *     `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.Resend)`
   *
   */
  IdoJourneyActionType['EmailOTPAuthentication'] = 'transmit_platform_email_otp_authentication';
  /**
   * @description `journeyStepId` for SMS OTP authentication action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   *
   * ```json
   * {
   *  "data": {
   *    "code_length": <integer_code_length>
   *   }
   * }
   * ```
   *
   * On failure, the `IdoServiceResponse` {@link IdoServiceResponse.errorData} field will contain either the error code {@link ErrorCode.InvalidCredentials}, or the error code {@link ErrorCode.ExpiredOTPPasscode}
   *
   * This can be used to indicate that the passcode is invalid, prompting the user to enter a new passcode.
   * Also, a resend option (see below) can be provided to the user.
   *
   * Client responses:
   *
   * - For simple submit of OTP passcode:
   * ```json
   *      tsPlatform.ido.submitClientResponse(
   *          ClientResponseOptionType.ClientInput,
   *          {
   *              "passcode": "<passcode>"
   *          })
   * ```
   *
   * - In Order to request resend of OTP (restart the action):
   *     `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.Resend)`
   *
   */
  IdoJourneyActionType['SmsOTPAuthentication'] = 'transmit_platform_sms_otp_authentication';
  /**
   * @description `journeyStepId` for TOTP Registration action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   * ```json
   * {
   *  "data": {
   *    "payload": {
   *      "secret": "<secret>",
   *      "uri": "<uri>"
   *     },
   *   }
   * }
   * ```
   * Use this data to display the TOTP registration QR code / link  to the user.
   * The user should use this to register the TOTP secret in their authenticator app.
   * Once the user has completed the registration, send the following empty client response:
   * ```json
   * tsPlatform.ido.submitClientResponse(
   *    ClientResponseOptionType.ClientInput
   * )
   * ```
   * Please note that registration of the TOTP secret is a silent action, and does not require user interaction.
   * An empty response is sent to the server in order to continue the journey.
   *
   */
  /**
   * @description `journeyStepId` for Email Validation action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   *
   * ```json
   * {
   *  "data": {
   *    "code_length": <integer_code_length>
   *   }
   * }
   * ```
   *
   * On failure, the `IdoServiceResponse` {@link IdoServiceResponse.errorData} field will contain either the error code {@link ErrorCode.InvalidCredentials}
   *
   * Resend option also (see below) can be provided to the user.
   *
   * Client responses:
   *
   * - For simple submit of validation passcode:
   * ```json
   *      tsPlatform.ido.submitClientResponse(
   *          ClientResponseOptionType.ClientInput,
   *          {
   *              "passcode": "<passcode>"
   *          })
   * ```
   *
   * - In Order to request resend of OTP (restart the action):
   *     `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.Resend)`
   *
   */
  IdoJourneyActionType['EmailValidation'] = 'transmit_platform_email_validation';
  /**
   * @description `journeyStepId` for Sms Validation action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   *
   * ```json
   * {
   *  "data": {
   *    "code_length": <integer_code_length>
   *   }
   * }
   * ```
   *
   * On failure, the `IdoServiceResponse` {@link IdoServiceResponse.errorData} field will contain either the error code {@link ErrorCode.InvalidCredentials}
   *
   * Resend option also (see below) can be provided to the user.
   *
   * Client responses:
   *
   * - For simple submit of validation passcode:
   * ```json
   *      tsPlatform.ido.submitClientResponse(
   *          ClientResponseOptionType.ClientInput,
   *          {
   *              "passcode": "<passcode>"
   *          })
   * ```
   *
   * - In Order to request resend of OTP (restart the action):
   *     `tsPlatform.ido.submitClientResponse(ClientResponseOptionType.Resend)`
   *
   */
  IdoJourneyActionType['SmsValidation'] = 'transmit_platform_sms_validation';
  IdoJourneyActionType['TotpRegistration'] = 'transmit_platform_totp_registration';
  /**
   * @description `journeyStepId` for Invoke IDP action.
   *
   * Data received in the {@link IdoServiceResponse} object:
   * ```json
   * {
   *  "data": {
   *    "authorization_url": "<URL_OF_THE_AUTHORIZATION_ENDPOINT>",
   *    "authorization_request_method": "<GET_OR_POST>",
   *    "invocation_method": "<PAGE_OR_POPUP>",
   *    "idp_name": "<IDP_NAME>"
   *  }
   * }
   * ```
   * Use this data to redirect the user to the IDP authorization endpoint.
   *
   *
   * Once done, send the following client response:
   * ```json
   * tsPlatform.ido.submitClientResponse(
   *    ClientResponseOptionType.ClientInput,
   *    {
   *       "idp_response" : {
   *          "code": "<code>",
   *          "state": "<state>",
   *       }
   *     }
   * )
   *```
   *
   *
   */
  IdoJourneyActionType['InvokeIDP'] = 'invoke_idp';
})(IdoJourneyActionType || (IdoJourneyActionType = {}));
