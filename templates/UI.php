<?php
    class UI {
        /**
         * The admin sidebar.
         *
         * Its links are relative, written for a page two levels deep under
         * admin/ (admin/listClients/ and so on). A page that lives elsewhere at
         * the same depth, such as the document generators under gen/, passes
         * the path from itself to admin/ so the links still land where they
         * should.
         */
        public static function getAsideContents(string $adminPath = '../'): string {
            return <<<HEREDOC
                        <nav>
                            <img
                            src="../../assets/img/logo.webp"
                            alt="Company Logo"
                            id="company_logo"
                            />

                            <details id="home" open>
                            <summary>Home</summary>
                            <ul>
                                <li>
                                <a
                                    href="{$adminPath}"
                                    class="view-existing"
                                    title="Payment and Application Status"
                                    >Summary</a
                                >
                                </li>
                                <li>
                                <a
                                    href="{$adminPath}interestedPeople/"
                                    class="view-existing"
                                    title="Interested People"
                                    >Potential Clients</a
                                >
                                </li>
                            </ul>
                            </details>

                            <details id="job_seekers" open>
                            <summary>Clients</summary>
                            <ul>
                                <li>
                                <a
                                    href="{$adminPath}listClients/"
                                    class="view-existing"
                                    title="View Clients"
                                    >List all</a
                                >
                                </li>
                                <li>
                                <a href="{$adminPath}addClient/" class="add-new" title="Add Client"
                                    >Add New</a
                                >
                                </li>
                            </ul>
                            </details>

                            <details id="available_jobs" open>
                            <summary>Vacancies</summary>
                            <ul>
                                <li>
                                <a href="{$adminPath}listJobs/" class="view-existing" title="View Vacancies"
                                    >List all</a
                                >
                                </li>
                                <li>
                                <a href="{$adminPath}addJob/" class="add-new" title="Add Vacancy"
                                    >Add New</a
                                >
                                </li>
                            </ul>
                            </details>

                            <details id="archived_data" open>
                            <summary>Archived</summary>
                            <ul>
                                <li>
                                <a
                                    href="{$adminPath}archivedClients/"
                                    class="view-existing"
                                    title="View Old Clients"
                                    >Clients</a
                                >
                                </li>
                                <li>
                                <a
                                    href="{$adminPath}archivedJobs/"
                                    class="view-existing"
                                    title="View Old Jobs"
                                    >Vacancies</a
                                >
                                </li>
                            </ul>
                            </details>
                        </nav>
                        <button type="button" id="logout_button">Logout</button>
                    HEREDOC;
        }

        public static function getHeaderContents(string $heading): string {
            return <<<HEREDOC
                        <span>$heading</span>
                        <span id="notification_container" title="View Notifications">
                        <button
                            type="button"
                            id="notification_bell"
                            aria-label="Notification Icon"
                        ></button>
                        <section id="notifications_menu"></section>
                        <div class="notification-overlay"></div>
                        </span>
                    HEREDOC;
        }
    }