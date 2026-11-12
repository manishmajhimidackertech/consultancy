<?php

/**
 * One client's record, as the document generators under gen/ need it.
 *
 * The CV and MOU pages work from a single client, together with the vacancies
 * that client has been put forward for: the MOU names the position and, when
 * the fee is a share of the first month's salary, needs that salary to work
 * the amount out. The listing endpoints return every client and no
 * applications, so they cannot serve this without sending the whole register
 * to a page that prints one person.
 *
 * Columns are named rather than selected with *, so the uploaded documents,
 * archive remarks and anything added to the table later stay off a page that
 * never shows them.
 */
final class ClientProfile
{
    /**
     * The client and their applications, or null if there is no such client.
     *
     * Archived clients are found, because an agreement may need reprinting
     * after a client has been taken off the working list. Deleted ones are not.
     *
     * @return array{client: array<string, mixed>, applications: list<array<string, mixed>>}|null
     */
    public static function find(SQLite3 $db, string $id): ?array
    {
        $id = trim($id);

        if ($id === '') {
            return null;
        }

        $stmt = $db->prepare(
            "SELECT id, name, address, mobileNumber, email, gender, bikeLicense, jobPreferences, profilePic, submittedAt
             FROM clients
             WHERE id = :id AND visibility != 'Deleted'"
        );
        $stmt->bindValue(':id', $id, SQLITE3_TEXT);

        $client = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

        if ($client === false) {
            return null;
        }

        $client['jobPreferences'] = self::decodeList($client['jobPreferences']);

        return [
            'client'       => $client,
            'applications' => self::applicationsOf($db, $id),
        ];
    }

    /**
     * Every vacancy the client has been put forward for, newest first.
     *
     * @return list<array<string, mixed>>
     */
    public static function applicationsOf(SQLite3 $db, string $id): array
    {
        $stmt = $db->prepare(
            'SELECT
                jobs.id AS jobID,
                jobs.position,
                jobs.companyName,
                jobs.address AS companyAddress,
                jobs.minimumSalary,
                payments_and_status.applicationState,
                payments_and_status.paymentState
             FROM payments_and_status
             JOIN jobs ON payments_and_status.jobID = jobs.id
             WHERE payments_and_status.UUID = :id
             ORDER BY payments_and_status.submittedAt DESC, payments_and_status.id DESC'
        );
        $stmt->bindValue(':id', $id, SQLITE3_TEXT);

        $result = $stmt->execute();

        $applications = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $applications[] = $row;
        }

        return $applications;
    }

    /**
     * Decode a JSON list column, treating anything else as empty.
     *
     * Rows written before validation was added can hold a bare JSON string or
     * nothing at all, and the pages iterate over this value without checking.
     *
     * @return list<string>
     */
    public static function decodeList(mixed $json): array
    {
        if (!is_string($json) || $json === '') {
            return [];
        }

        $decoded = json_decode($json, true);

        if (is_string($decoded)) {
            $decoded = [$decoded];
        }

        if (!is_array($decoded)) {
            return [];
        }

        return array_values(array_filter(
            array_map(static fn ($item) => is_scalar($item) ? trim((string) $item) : '', $decoded),
            static fn (string $item) => $item !== ''
        ));
    }
}
