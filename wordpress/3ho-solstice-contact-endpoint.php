<?php
/**
 * Plugin Name: 3HO Solstice Contact Endpoint
 * Description: Receives Summer Solstice PWA contact messages and sends them through WordPress mail.
 * Version: 1.0.1
 * Author: 3HO
 */

if (!defined('ABSPATH')) {
    exit;
}

function threeho_solstice_contact_clean($value) {
    if (!is_scalar($value)) {
        return '';
    }

    return trim((string) $value);
}

function threeho_solstice_contact_payload_value($payload, $key) {
    if (!is_array($payload) || !array_key_exists($key, $payload)) {
        return '';
    }

    return threeho_solstice_contact_clean($payload[$key]);
}

function threeho_solstice_contact_truncate($value, $max_length) {
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max_length);
    }

    return substr($value, 0, $max_length);
}

function threeho_solstice_contact_allowed_origins() {
    $origins = array(
        'https://summer-solstice-sadhana-2026.vercel.app',
        'https://www.3ho.org',
        'https://3ho.org',
    );

    return apply_filters('threeho_solstice_contact_allowed_origins', $origins);
}

function threeho_solstice_contact_origin_allowed($origin) {
    if (!$origin) {
        return true;
    }

    return in_array($origin, threeho_solstice_contact_allowed_origins(), true);
}

function threeho_solstice_contact_response($data, $status = 200, $origin = '') {
    $response = new WP_REST_Response($data, $status);
    $response->header('Access-Control-Allow-Origin', $origin ? $origin : '*');
    $response->header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->header('Access-Control-Allow-Headers', 'Content-Type');
    $response->header('Vary', 'Origin');

    return $response;
}

function threeho_solstice_contact_remote_ip() {
    $headers = array('HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');

    foreach ($headers as $header) {
        if (empty($_SERVER[$header])) {
            continue;
        }

        $value = sanitize_text_field(wp_unslash($_SERVER[$header]));
        $parts = explode(',', $value);
        $ip = trim($parts[0]);

        if ($ip) {
            return $ip;
        }
    }

    return 'unknown';
}

function threeho_solstice_contact_rate_limited() {
    $ip = threeho_solstice_contact_remote_ip();
    $key = 'threeho_solstice_contact_rate_' . md5($ip);
    $count = (int) get_transient($key);
    $limit = (int) apply_filters('threeho_solstice_contact_rate_limit', 10, $ip);

    if ($count >= $limit) {
        return true;
    }

    set_transient($key, $count + 1, MINUTE_IN_SECONDS);

    return false;
}

function threeho_solstice_contact_to_email($payload) {
    $default = defined('THREEHO_SOLSTICE_CONTACT_TO_EMAIL')
        ? THREEHO_SOLSTICE_CONTACT_TO_EMAIL
        : 'developer@3ho.org';

    return apply_filters('threeho_solstice_contact_to_email', $default, $payload);
}

function threeho_solstice_contact_format_date($value) {
    $timestamp = strtotime($value);

    if (!$timestamp) {
        return $value;
    }

    return date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $timestamp);
}

function threeho_solstice_contact_detail_row($label, $value, $href = '') {
    $display = $value ? $value : '-';
    $safe_value = esc_html($display);

    if ($href && $value) {
        $safe_value = sprintf(
            '<a href="%s" style="color:#2f62b6;text-decoration:underline;">%s</a>',
            esc_url($href),
            esc_html($display)
        );
    }

    return sprintf(
        '<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;vertical-align:top;width:120px;">%s</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;">%s</td></tr>',
        esc_html($label),
        $safe_value
    );
}

function threeho_solstice_contact_format_body($payload) {
    $category = threeho_solstice_contact_payload_value($payload, 'category') ?: 'General support';
    $name = threeho_solstice_contact_payload_value($payload, 'name');
    $email = threeho_solstice_contact_payload_value($payload, 'email');
    $phone = threeho_solstice_contact_payload_value($payload, 'phone');
    $message = threeho_solstice_contact_payload_value($payload, 'message');
    $created_at = threeho_solstice_contact_format_date(threeho_solstice_contact_payload_value($payload, 'createdAt'));
    $message_id = threeho_solstice_contact_payload_value($payload, 'id');
    $event = threeho_solstice_contact_payload_value($payload, 'event') ?: 'Summer Solstice Sadhana 2026';
    $source = threeho_solstice_contact_payload_value($payload, 'source');
    $attempts = threeho_solstice_contact_payload_value($payload, 'attempts');
    $page_url = threeho_solstice_contact_payload_value($payload, 'pageUrl');
    $user_agent = threeho_solstice_contact_payload_value($payload, 'userAgent');
    $reply_href = $email ? 'mailto:' . $email . '?subject=' . rawurlencode('Re: [Summer Solstice] ' . $category) : '';
    $phone_href = $phone ? 'tel:' . preg_replace('/[^0-9+]/', '', $phone) : '';

    return '<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f6f8fb;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">New Summer Solstice contact message from ' . esc_html($name) . '.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;margin:0;padding:24px 0;width:100%;">
    <tr>
      <td align="center" style="padding:0 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dbeafe;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:#2f62b6;padding:22px 24px;">
              <div style="color:#bfdbfe;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">3HO Summer Solstice</div>
              <h1 style="margin:7px 0 0;color:#ffffff;font-size:24px;line-height:1.2;font-weight:800;">New contact message</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:0 0 18px;">
                    <span style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;color:#9a3412;font-size:12px;font-weight:800;padding:7px 11px;">' . esc_html($category) . '</span>
                    <span style="display:inline-block;color:#64748b;font-size:13px;font-weight:700;margin-left:8px;">' . esc_html($event) . '</span>
                  </td>
                </tr>
              </table>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 18px 16px;">
                <div style="color:#64748b;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Message</div>
                <div style="color:#0f172a;font-size:16px;line-height:1.6;font-weight:500;">' . nl2br(esc_html($message)) . '</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 0;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:16px;line-height:1.3;font-weight:800;">Contact details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
                ' . threeho_solstice_contact_detail_row('Name', $name) . '
                ' . threeho_solstice_contact_detail_row('Email', $email, $email ? 'mailto:' . $email : '') . '
                ' . threeho_solstice_contact_detail_row('Phone', $phone, $phone_href) . '
              </table>
              ' . ($reply_href ? '<div style="padding-top:18px;"><a href="' . esc_url($reply_href) . '" style="display:inline-block;background:#2f62b6;border-radius:12px;color:#ffffff;font-size:14px;font-weight:800;padding:12px 16px;text-decoration:none;">Reply by email</a></div>' : '') . '
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="background:#f1f5f9;border-radius:14px;padding:14px 16px;">
                <div style="color:#64748b;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Submission metadata</div>
                <div style="color:#475569;font-size:12px;line-height:1.65;">
                  <strong>Created:</strong> ' . esc_html($created_at) . '<br>
                  <strong>Message ID:</strong> ' . esc_html($message_id) . '<br>
                  <strong>Attempts:</strong> ' . esc_html($attempts) . '<br>
                  <strong>Source:</strong> ' . esc_html($source) . '<br>
                  <strong>Page:</strong> ' . ($page_url ? '<a href="' . esc_url($page_url) . '" style="color:#2f62b6;text-decoration:underline;">' . esc_html($page_url) . '</a>' : '-') . '<br>
                  <strong>User agent:</strong> ' . esc_html($user_agent) . '
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';
}

function threeho_solstice_contact_handle(WP_REST_Request $request) {
    $origin = get_http_origin();

    if (!threeho_solstice_contact_origin_allowed($origin)) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'Origin not allowed.'),
            403,
            ''
        );
    }

    if ($request->get_method() === 'OPTIONS') {
        return threeho_solstice_contact_response(array('ok' => true), 200, $origin);
    }

    $payload = $request->get_json_params();

    if (!is_array($payload)) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'Invalid JSON.'),
            400,
            $origin
        );
    }

    $message_id = sanitize_key(threeho_solstice_contact_payload_value($payload, 'id'));
    $name = threeho_solstice_contact_truncate(sanitize_text_field(threeho_solstice_contact_payload_value($payload, 'name')), 120);
    $email = sanitize_email(threeho_solstice_contact_payload_value($payload, 'email'));
    $phone = threeho_solstice_contact_truncate(sanitize_text_field(threeho_solstice_contact_payload_value($payload, 'phone')), 80);
    $category = threeho_solstice_contact_truncate(sanitize_text_field(threeho_solstice_contact_payload_value($payload, 'category') ?: 'General support'), 120);
    $message = threeho_solstice_contact_truncate(sanitize_textarea_field(threeho_solstice_contact_payload_value($payload, 'message')), 4000);

    if (!$name || (!$email && !$phone) || !$message) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'Missing required contact fields.'),
            400,
            $origin
        );
    }

    if ($message_id) {
        $dedupe_key = 'threeho_solstice_contact_sent_' . md5($message_id);

        if (get_transient($dedupe_key)) {
            return threeho_solstice_contact_response(
                array('ok' => true, 'duplicate' => true),
                200,
                $origin
            );
        }
    }

    if (threeho_solstice_contact_rate_limited()) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'Too many requests.'),
            429,
            $origin
        );
    }

    $payload['name'] = $name;
    $payload['email'] = $email;
    $payload['phone'] = $phone;
    $payload['category'] = $category ?: 'General support';
    $payload['message'] = $message;

    $to = sanitize_email(threeho_solstice_contact_to_email($payload));

    if (!$to) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'Recipient is not configured.'),
            500,
            $origin
        );
    }

    $subject = '[Summer Solstice] ' . $payload['category'];
    $headers = array('Content-Type: text/html; charset=UTF-8');

    if ($email) {
        $headers[] = sprintf('Reply-To: %s <%s>', $name, $email);
    }

    $sent = wp_mail($to, $subject, threeho_solstice_contact_format_body($payload), $headers);

    if (!$sent) {
        return threeho_solstice_contact_response(
            array('ok' => false, 'error' => 'WordPress could not send the message.'),
            502,
            $origin
        );
    }

    if (!empty($dedupe_key)) {
        set_transient($dedupe_key, 1, WEEK_IN_SECONDS);
    }

    return threeho_solstice_contact_response(array('ok' => true), 200, $origin);
}

add_action('rest_api_init', function () {
    register_rest_route('3ho-solstice/v1', '/contact', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => 'threeho_solstice_contact_handle',
        'permission_callback' => '__return_true',
    ));
});
