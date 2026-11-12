<?php

require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'utils' . DIRECTORY_SEPARATOR . 'ClientProfile.php';
require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'db' . DIRECTORY_SEPARATOR . 'Schema.php';

/*
 * Cover for the lookup behind api/fetch/client.php, which the CV and MOU
 * generators read from. Run against a temporary database built from the same
 * schema the application uses, so a column renamed there fails here.
 */

/** A database holding one client, two vacancies, and an application to each. */
function clientProfileDatabase(string $visibility = 'Normal'): SQLite3
{
    $db = new SQLite3(':memory:');
    $db->enableExceptions(true);

    Schema::ensureClients($db);
    Schema::ensureJobs($db);
    Schema::ensurePaymentsAndStatus($db);

    $stmt = $db->prepare(
        "INSERT INTO clients (id, name, address, mobileNumber, email, gender, bikeLicense, jobPreferences, documents, profilePic, visibility, remarks)
         VALUES ('sr_261112-101500-ab12', 'Sita Rai', 'Damak - 4, Jhapa', '9812345678', 'sita@example.com', 'Female', 'yes',
                 '[\"Teacher\",\"Accountant\"]', '[\"uploads/sr/docs/a.jpg\"]', 'uploads/sr/profile/p.jpg', :visibility, 'moved abroad')"
    );
    $stmt->bindValue(':visibility', $visibility, SQLITE3_TEXT);
    $stmt->execute();

    $db->exec(
        "INSERT INTO jobs (id, companyName, address, mobileNumber, position, minimumSalary)
         VALUES ('lmn_21', 'LMN Accounting', 'Biratnagar - 4', '9800000003', 'Accountant', 21000),
                ('sch_18', 'Kankai School', 'Kankai - 5', '9800000020', 'Teacher', 18000)"
    );

    $db->exec(
        "INSERT INTO payments_and_status (UUID, jobID, applicationState, paymentState, submittedAt)
         VALUES ('sr_261112-101500-ab12', 'sch_18', 'Rejected', 'Cancelled', '2026-10-01 09:00:00'),
                ('sr_261112-101500-ab12', 'lmn_21', 'Accepted', 'Not Paid', '2026-11-01 09:00:00')"
    );

    return $db;
}

test('a client is found with their preferences decoded', function (): void {
    $profile = ClientProfile::find(clientProfileDatabase(), 'sr_261112-101500-ab12');

    assertTrue($profile !== null, 'the client is found');
    assertSame('Sita Rai', $profile['client']['name'], 'the name is returned');
    assertSame(['Teacher', 'Accountant'], $profile['client']['jobPreferences'], 'preferences arrive as a list');
    assertSame('uploads/sr/profile/p.jpg', $profile['client']['profilePic'], 'the photograph path is returned');
});

test('fields the generators never show are left out', function (): void {
    $client = ClientProfile::find(clientProfileDatabase(), 'sr_261112-101500-ab12')['client'];

    assertFalse(array_key_exists('documents', $client), 'uploaded documents are not sent');
    assertFalse(array_key_exists('remarks', $client), 'archive remarks are not sent');
    assertFalse(array_key_exists('visibility', $client), 'visibility is not sent');
});

test('applications come with their vacancy, newest first', function (): void {
    $applications = ClientProfile::find(clientProfileDatabase(), 'sr_261112-101500-ab12')['applications'];

    assertSame(2, count($applications), 'both applications are returned');
    assertSame('Accountant', $applications[0]['position'], 'the newest application is first');
    assertSame('LMN Accounting', $applications[0]['companyName'], 'the employer is joined in');
    assertSame(21000, $applications[0]['minimumSalary'], 'the salary is an integer, for the fee calculation');
    assertSame('Teacher', $applications[1]['position'], 'the older application follows');
});

test('an unknown, blank or deleted client is not found', function (): void {
    assertNull(ClientProfile::find(clientProfileDatabase(), 'nobody'), 'unknown identifier');
    assertNull(ClientProfile::find(clientProfileDatabase(), '   '), 'blank identifier');
    assertNull(ClientProfile::find(clientProfileDatabase('Deleted'), 'sr_261112-101500-ab12'), 'deleted client');
});

test('an archived client is still found, so an agreement can be reprinted', function (): void {
    assertTrue(
        ClientProfile::find(clientProfileDatabase('Archived'), 'sr_261112-101500-ab12') !== null,
        'archived client'
    );
});

test('the identifier is bound, not interpolated', function (): void {
    assertNull(
        ClientProfile::find(clientProfileDatabase(), "x' OR '1'='1"),
        'a quote in the identifier matches nothing rather than everything'
    );
});

test('list columns written by older versions decode safely', function (): void {
    assertSame(['Driver'], ClientProfile::decodeList('"Driver"'), 'a bare JSON string becomes a one-item list');
    assertSame([], ClientProfile::decodeList(null), 'null');
    assertSame([], ClientProfile::decodeList(''), 'empty string');
    assertSame([], ClientProfile::decodeList('not json'), 'malformed JSON');
    assertSame(['Teacher'], ClientProfile::decodeList('[" Teacher ", "", null]'), 'blanks dropped, entries trimmed');
});
