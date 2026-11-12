<?php
    require_once dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'auth' . DIRECTORY_SEPARATOR . 'Session.php';
    include dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'auth' . DIRECTORY_SEPARATOR . 'CORS.php';
    Session::init();

    if (!isset($_SESSION['user_name'])) {
        $currentUrl = urlencode($_SERVER['REQUEST_URI']);
        header("Location: ../../login/?redirect=$currentUrl");
        exit();
    }

    $env = parse_ini_file(dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env');
    // Escaped because, unlike the admin pages, these are also written into
    // attributes here, which the generator script reads for the letterhead.
    $companyName = htmlspecialchars($env["COMPANY_NAME"], ENT_QUOTES);
    $domainName = htmlspecialchars(preg_replace('#^https?://#i', '', rtrim($env["DOMAIN_NAME"] ?? '', '/')), ENT_QUOTES);

    require_once dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'UI.php';
    $asideContents = UI::getAsideContents('../../admin/');
    $headerContents = UI::getHeaderContents("Create MOU");

    $htmlContent = str_replace(['{{COMPANY_NAME}}', '{{DOMAIN_NAME}}', '{{ASIDE_CONTENTS}}', '{{HEADER_CONTENTS}}'], [$companyName, $domainName, $asideContents, $headerContents], file_get_contents('mou.html'));

    echo $htmlContent;
