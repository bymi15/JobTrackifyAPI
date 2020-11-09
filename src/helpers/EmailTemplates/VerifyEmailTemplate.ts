import { User } from '../../api/entities/User';

export default function VerifyEmailTemplate(user: User, url: string) {
  return (
    "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional //EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>" +
    '' +
    "<html xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:v='urn:schemas-microsoft-com:vml'>" +
    '<head>' +
    '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->' +
    "<meta content='text/html; charset=utf-8' http-equiv='Content-Type'/>" +
    "<meta content='width=device-width' name='viewport'/>" +
    '<!--[if !mso]><!-->' +
    "<meta content='IE=edge' http-equiv='X-UA-Compatible'/>" +
    '<!--<![endif]-->' +
    '<title></title>' +
    '<!--[if !mso]><!-->' +
    "<link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'/>" +
    "<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'/>" +
    '<!--<![endif]-->' +
    "<style type='text/css'>" +
    'body {' +
    'margin: 0;' +
    'padding: 0;' +
    '}' +
    '' +
    'table,' +
    'td,' +
    'tr {' +
    'vertical-align: top;' +
    'border-collapse: collapse;' +
    '}' +
    '' +
    '* {' +
    'line-height: inherit;' +
    '}' +
    '' +
    'a[x-apple-data-detectors=true] {' +
    'color: inherit !important;' +
    'text-decoration: none !important;' +
    '}' +
    '</style>' +
    "<style id='media-query' type='text/css'>" +
    '@media (max-width: 660px) {' +
    '' +
    '.block-grid,' +
    '.col {' +
    'min-width: 320px !important;' +
    'max-width: 100% !important;' +
    'display: block !important;' +
    '}' +
    '' +
    '.block-grid {' +
    'width: 100% !important;' +
    '}' +
    '' +
    '.col {' +
    'width: 100% !important;' +
    '}' +
    '' +
    '.col_cont {' +
    'margin: 0 auto;' +
    '}' +
    '' +
    'img.fullwidth,' +
    'img.fullwidthOnMobile {' +
    'max-width: 100% !important;' +
    '}' +
    '' +
    '.no-stack .col {' +
    'min-width: 0 !important;' +
    'display: table-cell !important;' +
    '}' +
    '' +
    '.no-stack.two-up .col {' +
    'width: 50% !important;' +
    '}' +
    '' +
    '.no-stack .col.num2 {' +
    'width: 16.6% !important;' +
    '}' +
    '' +
    '.no-stack .col.num3 {' +
    'width: 25% !important;' +
    '}' +
    '' +
    '.no-stack .col.num4 {' +
    'width: 33% !important;' +
    '}' +
    '' +
    '.no-stack .col.num5 {' +
    'width: 41.6% !important;' +
    '}' +
    '' +
    '.no-stack .col.num6 {' +
    'width: 50% !important;' +
    '}' +
    '' +
    '.no-stack .col.num7 {' +
    'width: 58.3% !important;' +
    '}' +
    '' +
    '.no-stack .col.num8 {' +
    'width: 66.6% !important;' +
    '}' +
    '' +
    '.no-stack .col.num9 {' +
    'width: 75% !important;' +
    '}' +
    '' +
    '.no-stack .col.num10 {' +
    'width: 83.3% !important;' +
    '}' +
    '' +
    '.video-block {' +
    'max-width: none !important;' +
    '}' +
    '' +
    '.mobile_hide {' +
    'min-height: 0px;' +
    'max-height: 0px;' +
    'max-width: 0px;' +
    'display: none;' +
    'overflow: hidden;' +
    'font-size: 0px;' +
    '}' +
    '' +
    '.desktop_hide {' +
    'display: block !important;' +
    'max-height: none !important;' +
    '}' +
    '}' +
    '</style>' +
    '</head>' +
    "<body class='clean-body' style='margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;'>" +
    "<!--[if IE]><div class='ie-browser'><![endif]-->" +
    "<table bgcolor='#ffffff' cellpadding='0' cellspacing='0' class='nl-container' role='presentation' style='table-layout: fixed; vertical-align: top; min-width: 320px; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td style='word-break: break-word; vertical-align: top;' valign='top'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td align='center' style='background-color:#ffffff'><![endif]-->" +
    "<div style='background-color:transparent;'>" +
    "<div class='block-grid' style='min-width: 320px; max-width: 640px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;'>" +
    "<div style='border-collapse: collapse;display: table;width: 100%;background-color:transparent;'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:transparent;'><tr><td align='center'><table cellpadding='0' cellspacing='0' border='0' style='width:640px'><tr class='layout-full-width' style='background-color:transparent'><![endif]-->" +
    "<!--[if (mso)|(IE)]><td align='center' width='640' style='background-color:transparent;width:640px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;'><![endif]-->" +
    "<div class='col num12' style='min-width: 320px; max-width: 640px; display: table-cell; vertical-align: top; width: 640px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    "<div align='center' class='img-container center fixedwidth' style='padding-right: 10px;padding-left: 10px;'>" +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr style='line-height:0px'><td style='padding-right: 10px;padding-left: 10px;' align='center'><![endif]-->" +
    "<div style='font-size:1px;line-height:10px'> </div><img align='center' alt='Logo' border='0' class='center fixedwidth' src='https://jobtrackify.com/logo192.png' style='text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 128px; display: block;' title='Logo' width='128'/>" +
    "<div style='font-size:1px;line-height:15px'> </div>" +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    '</div>' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '<!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->' +
    '</div>' +
    '</div>' +
    '</div>' +
    "<div style='background-color:transparent;'>" +
    "<div class='block-grid' style='min-width: 320px; max-width: 640px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;'>" +
    "<div style='border-collapse: collapse;display: table;width: 100%;background-color:transparent;'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:transparent;'><tr><td align='center'><table cellpadding='0' cellspacing='0' border='0' style='width:640px'><tr class='layout-full-width' style='background-color:transparent'><![endif]-->" +
    "<!--[if (mso)|(IE)]><td align='center' width='640' style='background-color:transparent;width:640px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;'><![endif]-->" +
    "<div class='col num12' style='min-width: 320px; max-width: 640px; display: table-cell; vertical-align: top; width: 640px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;'>" +
    "<div style='line-height: 1.2; font-size: 12px; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; color: #555555; mso-line-height-alt: 14px;'>" +
    "<p style='font-size: 42px; line-height: 1.2; word-break: break-word; text-align: center; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 50px; margin: 0;'><span style='font-size: 42px;'>Welcome to <strong>Job Trackify</strong><br/></span></p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '<!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->' +
    '</div>' +
    '</div>' +
    '</div>' +
    "<div style='background-color:transparent;'>" +
    "<div class='block-grid' style='min-width: 320px; max-width: 640px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #ffffff;'>" +
    "<div style='border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:transparent;'><tr><td align='center'><table cellpadding='0' cellspacing='0' border='0' style='width:640px'><tr class='layout-full-width' style='background-color:#ffffff'><![endif]-->" +
    "<!--[if (mso)|(IE)]><td align='center' width='640' style='background-color:#ffffff;width:640px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;'><![endif]-->" +
    "<div class='col num12' style='min-width: 320px; max-width: 640px; display: table-cell; vertical-align: top; width: 640px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 25px; padding-left: 25px; padding-top: 0px; padding-bottom: 0px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.2;padding-top:0px;padding-right:25px;padding-bottom:0px;padding-left:25px;'>" +
    "<div style='line-height: 1.2; font-size: 12px; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #555555; mso-line-height-alt: 14px;'>" +
    "<p style='font-size: 18px; line-height: 1.2; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 22px; margin: 0;'><span style='font-size: 18px;'><strong>Complete your registration by verifying your email address<br/></strong></span></p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<table border='0' cellpadding='0' cellspacing='0' class='divider' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td class='divider_inner' style='word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;' valign='top'>" +
    "<table align='center' border='0' cellpadding='0' cellspacing='0' class='divider_content' height='20' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 20px; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td height='20' style='word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top'><span></span></td>" +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '<!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->' +
    '</div>' +
    '</div>' +
    '</div>' +
    "<div style='background-color:transparent;'>" +
    "<div class='block-grid three-up' style='min-width: 320px; max-width: 640px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #ffffff;'>" +
    "<div style='border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:transparent;'><tr><td align='center'><table cellpadding='0' cellspacing='0' border='0' style='width:640px'><tr class='layout-full-width' style='background-color:#ffffff'><![endif]-->" +
    "<!--[if (mso)|(IE)]><td align='center' width='106' style='background-color:#ffffff;width:106px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;'><![endif]-->" +
    "<div class='col num2' style='display: table-cell; vertical-align: top; max-width: 320px; min-width: 106px; width: 106px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    '<div></div>' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    "<!--[if (mso)|(IE)]></td><td align='center' width='426' style='background-color:#ffffff;width:426px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;background-color:#f1f2f6;'><![endif]-->" +
    "<div class='col num8' style='display: table-cell; vertical-align: top; min-width: 320px; max-width: 424px; background-color: #f1f2f6; width: 426px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    "<table border='0' cellpadding='0' cellspacing='0' class='divider' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td class='divider_inner' style='word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;' valign='top'>" +
    "<table align='center' border='0' cellpadding='0' cellspacing='0' class='divider_content' height='15' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 15px; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td height='15' style='word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top'><span></span></td>" +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    "<table border='0' cellpadding='0' cellspacing='0' class='divider' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td class='divider_inner' style='word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;' valign='top'>" +
    "<table align='center' border='0' cellpadding='0' cellspacing='0' class='divider_content' height='15' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 15px; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td height='15' style='word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top'><span></span></td>" +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top: 0px; padding-bottom: 0px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.5;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;'>" +
    "<div style='line-height: 1.5; font-size: 12px; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #555555; mso-line-height-alt: 18px;'>" +
    `<p style='font-size: 15px; line-height: 1.5; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 23px; margin: 0;'><span style='font-size: 15px;'><strong>Dear ${user.firstName} ${user.lastName}</strong>,<br/><br/></span></p>` +
    "<p style='font-size: 15px; line-height: 1.5; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 23px; margin: 0;'><span style='font-size: 15px;'>Thank you for signing up to Job Trackify!<br/><br/>We just need to verify your email address to complete setting up your account.<br/></span></p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<div align='center' class='button-container' style='padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;'>" +
    `<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;'><tr><td style='padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px' align='center'><v:roundrect xmlns:v='urn:schemas-microsoft-com:vml' xmlns:w='urn:schemas-microsoft-com:office:word' href='${url}' style='height:31.5pt; width:198pt; v-text-anchor:middle;' arcsize='10%' stroke='false' fillcolor='#f50057'><w:anchorlock/><v:textbox inset='0,0,0,0'><center style='color:#ffffff; font-family:Arial, sans-serif; font-size:16px'><![endif]--><a href=${url} style='-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #f50057; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width: auto; width: auto; border-top: 1px solid #f50057; border-right: 1px solid #f50057; border-bottom: 1px solid #f50057; border-left: 1px solid #f50057; padding-top: 5px; padding-bottom: 5px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; text-align: center; mso-border-alt: none; word-break: keep-all;' target='_blank'><span style='padding-left:45px;padding-right:45px;font-size:16px;display:inline-block;'><span style='font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;'>Verify Email</span></span></a>` +
    '<!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->' +
    '</div>' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;'>" +
    "<div style='padding-top: 15px; line-height: 1.2; font-size: 12px; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #555555; mso-line-height-alt: 14px;'><span style='font-size: 14px;'>Or copy the following link and paste it into your web browser:</span></div>" +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top: 0px; padding-bottom: 0px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#3f51b5;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.5;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;'>" +
    "<div style='line-height: 1.5; font-size: 12px; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #3f51b5; mso-line-height-alt: 18px;'>" +
    `<p style='font-size: 14px; line-height: 1.5; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 21px; margin: 0;'><span style='color: #3f51b5;'><a href=${url} rel='noopener' style='text-decoration: underline; color: #3f51b5;' target='_blank'><span style='font-size: 12px;'><strong><span style=''>${url}</span></strong></span></a></span></p>` +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<table border='0' cellpadding='0' cellspacing='0' class='divider' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td class='divider_inner' style='word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 60px; padding-bottom: 5px; padding-left: 60px;' valign='top'>" +
    "<table align='center' border='0' cellpadding='0' cellspacing='0' class='divider_content' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 1px solid #BBBBBB; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td style='word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top'><span></span></td>" +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.2;padding-top:5px;padding-right:10px;padding-bottom:10px;padding-left:10px;'>" +
    "<div style='line-height: 1.2; font-size: 12px; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #555555; mso-line-height-alt: 14px;'>" +
    "<p style='font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;'>Thank you,</p>" +
    "<p style='font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;'>The Job Trackify Team</p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    "<!--[if (mso)|(IE)]></td><td align='center' width='106' style='background-color:#ffffff;width:106px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;'><![endif]-->" +
    "<div class='col num2' style='display: table-cell; vertical-align: top; max-width: 320px; min-width: 106px; width: 106px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    '<div></div>' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '<!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->' +
    '</div>' +
    '</div>' +
    '</div>' +
    "<div style='background-color:transparent;'>" +
    "<div class='block-grid' style='min-width: 320px; max-width: 640px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #ffffff;'>" +
    "<div style='border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;'>" +
    "<!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:transparent;'><tr><td align='center'><table cellpadding='0' cellspacing='0' border='0' style='width:640px'><tr class='layout-full-width' style='background-color:#ffffff'><![endif]-->" +
    "<!--[if (mso)|(IE)]><td align='center' width='640' style='background-color:#ffffff;width:640px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;'><![endif]-->" +
    "<div class='col num12' style='min-width: 320px; max-width: 640px; display: table-cell; vertical-align: top; width: 640px;'>" +
    "<div class='col_cont' style='width:100% !important;'>" +
    '<!--[if (!mso)&(!IE)]><!-->' +
    "<div style='border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;'>" +
    '<!--<![endif]-->' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#555555;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;'>" +
    "<div style='line-height: 1.2; font-size: 12px; color: #555555; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 14px;'>" +
    "<p style='font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin: 0;'>Need assistance? Reach out to us at <a href='mailto:contact@jobtrackify.com' rel='noopener' style='text-decoration: underline; color: #3f51b5;' target='_blank'>contact@jobtrackify.com</a></p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<!--[if mso]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 25px; padding-left: 25px; padding-top: 5px; padding-bottom: 5px; font-family: Arial, sans-serif'><![endif]-->" +
    "<div style='color:#000000;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:1.2;padding-top:5px;padding-right:25px;padding-bottom:5px;padding-left:25px;'>" +
    "<div style='line-height: 1.2; font-size: 12px; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; mso-line-height-alt: 14px;'>" +
    "<p style='font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-alt: 17px; margin: 0;'><a href='https://www.jobtrackify.com' rel='noopener' style='text-decoration: underline; color: #3f51b5;' target='_blank'>Job Trackify</a> © All rights reserved 2020</p>" +
    '</div>' +
    '</div>' +
    '<!--[if mso]></td></tr></table><![endif]-->' +
    "<table border='0' cellpadding='0' cellspacing='0' class='divider' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td class='divider_inner' style='word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;' valign='top'>" +
    "<table align='center' border='0' cellpadding='0' cellspacing='0' class='divider_content' height='40' role='presentation' style='table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 40px; width: 100%;' valign='top' width='100%'>" +
    '<tbody>' +
    "<tr style='vertical-align: top;' valign='top'>" +
    "<td height='40' style='word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' valign='top'><span></span></td>" +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '<!--[if (!mso)&(!IE)]><!-->' +
    '</div>' +
    '<!--<![endif]-->' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '<!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<!--[if (mso)|(IE)]></td></tr></table><![endif]-->' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '<!--[if (IE)]></div><![endif]-->' +
    '</body>' +
    '</html>'
  );
}
