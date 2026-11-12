<?php
    require_once dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'auth' . DIRECTORY_SEPARATOR . 'Session.php';
    require_once dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'utils' . DIRECTORY_SEPARATOR . 'Api.php';
    require_once dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'utils' . DIRECTORY_SEPARATOR . 'ClientProfile.php';
    Session::init();
    Api::begin();
    Api::requireAuth();
    Api::requireMethod('GET');

    $uuid = trim((string) ($_GET['uuid'] ?? ''));

    if ($uuid === '') {
        Api::fail('Client UUID is required.', 400);
    }

    try {
        $db = new SQLite3(dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'db' . DIRECTORY_SEPARATOR . 'data.sqlite');
        $db->enableExceptions(true);

        $profile = ClientProfile::find($db, $uuid);
        $db->close();
    } catch (Throwable $e) {
        Api::serverError($e, 'fetch/client');
    }

    if ($profile === null) {
        Api::fail('Client not found.', 404);
    }

    Api::send($profile);
