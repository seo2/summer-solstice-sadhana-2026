<?php
/**
 * Plugin Name: 3HO Solstice Contact Endpoint
 * Description: Receives Summer Solstice PWA contact messages and sends them through WordPress mail.
 * Version: 1.0.0
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

function threeho_solstice_contact_format_body($payload) {
    return implode("\n", array(
        'Source: ' . threeho_solstice_contact_payload_value($payload, 'source'),
        'Event: ' . threeho_solstice_contact_payload_value($payload, 'event'),
        'Message ID: ' . threeho_solstice_contact_payload_value($payload, 'id'),
        'Category: ' . threeho_solstice_contact_payload_value($payload, 'category'),
        '',
        'Name: ' . threeho_solstice_contact_payload_value($payload, 'name'),
        'Email: ' . (threeho_solstice_contact_payload_value($payload, 'email') ?: '-'),
        'Phone: ' . (threeho_solstice_contact_payload_value($payload, 'phone') ?: '-'),
        '',
        threeho_solstice_contact_payload_value($payload, 'message'),
        '',
        'Created in app: ' . threeho_solstice_contact_payload_value($payload, 'createdAt'),
        'Attempts: ' . threeho_solstice_contact_payload_value($payload, 'attempts'),
        'Page URL: ' . threeho_solstice_contact_payload_value($payload, 'pageUrl'),
        'User Agent: ' . threeho_solstice_contact_payload_value($payload, 'userAgent'),
    ));
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
    $headers = array('Content-Type: text/plain; charset=UTF-8');

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
