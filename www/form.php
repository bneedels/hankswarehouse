<?php
/* Specific values for different forms 
	You need to define 
	<input type="hidden" name="formtype" value="contactus" />
	in you html form
*/
$forms = array(
	"contactus" => array(
		"recipients" => "nramanenka@gmail.com",
		"subject" => "Contact Us Subject goes here",
		"thankyou" => "thank-you.html"
	),
	"signup" => array(
		"recipients" => "nramanenka@gmail.com,alisonrodeck@gmail.com",
		"subject" => "New Sing Up Request",
		"thankyou" => "thank-you-signup.html"
	)
);
/* Default values */
$recipients = "support@hanksclothing.com";
$subject = "Hanks Warehouse Inquiry";
$thankyou = "thank-you.html";
$logFileName = "formlogs/log.csv";
$errorFileName = "formlogs/error.csv";

/* PHP4 fixes*/
if (!function_exists('fputcsv')) {
    function fputcsv(&$handle, $fields = array(), $delimiter = ',', $enclosure = '"') {

        // Sanity Check
        if (!is_resource($handle)) {
            trigger_error('fputcsv() expects parameter 1 to be resource, ' .
                gettype($handle) . ' given', E_USER_WARNING);
            return false;
        }

        if ($delimiter!=NULL) {
            if( strlen($delimiter) < 1 ) {
                trigger_error('delimiter must be a character', E_USER_WARNING);
                return false;
            }elseif( strlen($delimiter) > 1 ) {
                trigger_error('delimiter must be a single character', E_USER_NOTICE);
            }

            /* use first character from string */
            $delimiter = $delimiter[0];
        }

        if( $enclosure!=NULL ) {
             if( strlen($enclosure) < 1 ) {
                trigger_error('enclosure must be a character', E_USER_WARNING);
                return false;
            }elseif( strlen($enclosure) > 1 ) {
                trigger_error('enclosure must be a single character', E_USER_NOTICE);
            }

            /* use first character from string */
            $enclosure = $enclosure[0];
       }

        $i = 0;
        $csvline = '';
        $escape_char = '\\';
        $field_cnt = count($fields);
        $enc_is_quote = in_array($enclosure, array('"',"'"));
        reset($fields);

        foreach( $fields AS $field ) {

            /* enclose a field that contains a delimiter, an enclosure character, or a newline */
            if( is_string($field) && (
                strpos($field, $delimiter)!==false ||
                strpos($field, $enclosure)!==false ||
                strpos($field, $escape_char)!==false ||
                strpos($field, "\n")!==false ||
                strpos($field, "\r")!==false ||
                strpos($field, "\t")!==false ||
                strpos($field, ' ')!==false ) ) {

                $field_len = strlen($field);
                $escaped = 0;

                $csvline .= $enclosure;
                for( $ch = 0; $ch < $field_len; $ch++ )    {
                    if( $field[$ch] == $escape_char && $field[$ch+1] == $enclosure && $enc_is_quote ) {
                        continue;
                    }elseif( $field[$ch] == $escape_char ) {
                        $escaped = 1;
                    }elseif( !$escaped && $field[$ch] == $enclosure ) {
                        $csvline .= $enclosure;
                    }else{
                        $escaped = 0;
                    }
                    $csvline .= $field[$ch];
                }
                $csvline .= $enclosure;
            } else {
                $csvline .= $field;
            }

            if( $i++ != $field_cnt ) {
                $csvline .= $delimiter;
            }
        }

        $csvline .= "\n";

        return fwrite($handle, $csvline);
    }
}


if($_REQUEST["formtype"] && isset($forms[$_REQUEST["formtype"]])){
	$recipients = $forms[$_REQUEST["formtype"]]["recipients"];
	$subject = $forms[$_REQUEST["formtype"]]["subject"];
	$thankyou = $forms[$_REQUEST["formtype"]]["thankyou"];
	$logFileName = "formlogs/".$_REQUEST["formtype"]."-log.csv";
	$errorFileName = "formlogs/".$_REQUEST["formtype"]."-error.csv";
}

$specialFields = array("formtype", "code", "PHPSESSID", "reporterror", "disablelog", "passwordlength");

$debug = false;

/* Validate posted data */
	$checkForm = true;
	if(isset($_REQUEST['code'])){
		include("securimage/securimage.php");
		$img = new Securimage();
	
		$valid = $img->check($_REQUEST['code']);
		if($valid == false){
			$checkForm = false;
		}
	}
	
	//save to the log
	if(isset($_REQUEST["reporterror"])){
		$filename = $errorFileName;
	}else{
		$filename = $logFileName;
	}
	if(file_exists($filename)){
		$f = fopen($filename, "a");
	}else{
		$f = fopen($filename, "a");
		$headers = array("Date");
		foreach ($_REQUEST as $row => $value){
			if(!in_array($row, $specialFields)){
				$headers[] = $row;
			}
		}
		$headers[] = "IP";
		$headers[] = "Referrer";
		$headers[] = "CAPTCHA";
		fputcsv($f, $headers, ",", '"');
	}
	$data = array(date("F j, Y, H:i:s"));
	foreach ($_REQUEST as $row => $value){
		if(!in_array($row, $specialFields)){			
			$data[] = $value;
		}
	}
	$data[] = $_SERVER['REMOTE_ADDR'];
	$data[] = getenv('HTTP_REFERER');
	if($checkForm == true){
		$data[] = "valid";
	}else{
		$data[] = "INVALID";
	}
	fputcsv($f, $data, ",", '"');
	fclose($f);	
	
	if(isset($_REQUEST["reporterror"])){
		exit();
	}

	if($checkForm == true){
		//send email		
		
		$message = "
		<html>
			<head>
 				<title>{$subject}</title>
			</head>
			<body>
 				<p>New request was sent</p>
 				<table>
 					<tbody>";
 			foreach ($_REQUEST as $row => $value){
 				if(!in_array($row, $specialFields)){
 					$row = ucwords($row);
						$message .= "<tr>
 							<td>{$row}</td>
 							<td>{$value}</td>
 						</tr>";
 				}
 			}
 					$message .= "</tbody>
 				</table>
 			</body>
		</html>";
		
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";


		foreach (split(",", $recipients) as $email){
					
			if(!empty($_REQUEST["email"])){
				$headers .= "From: {$_REQUEST["name"]} <{$_REQUEST["email"]}>" . "\r\n";
			}

			$success = mail($email, $subject, $message, $headers);
			if(!$success && $debug){
				echo "Error sending email;";
			}
		}
	}

	header("Location: {$thankyou}");
?>