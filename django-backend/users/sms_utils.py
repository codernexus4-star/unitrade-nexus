from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Try to import SMS library - make it optional for local development
SMS_ENABLED = True
try:
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
    from Zenoph.Notify.Enums.AuthModel import AuthModel
    from Zenoph.Notify.Enums.SMSType import SMSType
except ImportError:
    SMS_ENABLED = False
    logger.warning("SMS library (Zenoph.Notify) not available. SMS notifications will be disabled.")

def send_registration_sms(phone_number, user_name):
    if not SMS_ENABLED:
        logger.info(f"SMS disabled - Would send registration SMS to {phone_number} for {user_name}")
        return {'success': False, 'error': 'SMS library not available'}
    
    logger.debug(f"Attempting to send registration SMS: phone_number={phone_number!r}, user_name={user_name!r}, API_KEY={'set' if settings.ZENOPH_API_KEY else 'MISSING'}, SENDER_ID={settings.ZENOPH_SENDER_ID!r}")
    try:
        request = SMSRequest()
        logger.debug("Created SMSRequest object")
        
        # Set host
        request.setHost("api.smsonlinegh.com")
        logger.debug("Set host to api.smsonlinegh.com")
        
        request.setAuthModel(AuthModel.API_KEY)
        logger.debug("Set AuthModel to API_KEY")
        request.setAuthApiKey(settings.ZENOPH_API_KEY)
        logger.debug(f"Set API key: {settings.ZENOPH_API_KEY!r}")
        request.setSender(settings.ZENOPH_SENDER_ID)
        logger.debug(f"Set sender: {settings.ZENOPH_SENDER_ID!r}")
        
        message = f"Welcome to UniTrade, {user_name}! Your registration was successful. You can buy and sell safely from various university campuses in Ghana."
        request.setMessage(message)
        logger.debug(f"Set message: {message!r}")
        
        # Set SMS type
        request.setSMSType(SMSType.GSM_DEFAULT)
        logger.debug("Set SMS type to GSM_DEFAULT")
        
        request.addDestination(phone_number)
        logger.debug(f"Added destination: {phone_number!r}")
        response = request.submit()
        logger.debug(f"SMS sent, response: {response!r}")
        return {
            'success': True,
            'response': str(response)
        }
    except Exception as e:
        logger.error(f"Failed to send registration SMS to {phone_number}: {e}")
        return {
            'success': False,
            'error': str(e)
        } 

def send_sms_notification(phone_number, message):
    if not SMS_ENABLED:
        logger.info(f"SMS disabled - Would send notification to {phone_number}: {message}")
        return {'success': False, 'error': 'SMS library not available'}
    
    logger.debug(f"Attempting to send SMS notification: phone_number={phone_number!r}, API_KEY={'set' if settings.ZENOPH_API_KEY else 'MISSING'}, SENDER_ID={settings.ZENOPH_SENDER_ID!r}")
    try:
        request = SMSRequest()
        logger.debug("Created SMSRequest object")
        request.setHost("api.smsonlinegh.com")
        logger.debug("Set host to api.smsonlinegh.com")
        request.setAuthModel(AuthModel.API_KEY)
        logger.debug("Set AuthModel to API_KEY")
        request.setAuthApiKey(settings.ZENOPH_API_KEY)
        logger.debug(f"Set API key: {settings.ZENOPH_API_KEY!r}")
        request.setSender(settings.ZENOPH_SENDER_ID)
        logger.debug(f"Set sender: {settings.ZENOPH_SENDER_ID!r}")
        request.setMessage(message)
        logger.debug(f"Set message: {message!r}")
        request.setSMSType(SMSType.GSM_DEFAULT)
        logger.debug("Set SMS type to GSM_DEFAULT")
        request.addDestination(phone_number)
        logger.debug(f"Added destination: {phone_number!r}")
        response = request.submit()
        logger.debug(f"SMS sent, response: {response!r}")
        return {
            'success': True,
            'response': str(response)
        }
    except Exception as e:
        logger.error(f"Failed to send SMS notification to {phone_number}: {e}")
        return {
            'success': False,
            'error': str(e)
        } 