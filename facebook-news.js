/*
 * DKS Czarni Kozłowa Góra
 * Wyświetlanie najnowszego posta z Facebooka.
 *
 * Ten plik NIE zawiera tokena Facebooka.
 * Token jest używany wyłącznie przez GitHub Actions.
 */

document.addEventListener("DOMContentLoaded", async function () {

    const container = document.getElementById("facebook-news");

    if (!container) {
        return;
    }

    try {

        const response = await fetch(
            "data/facebook-post.json?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Nie udało się pobrać danych aktualności."
            );
        }

        const post = await response.json();

        if (
            !post ||
            !post.id ||
            (
                !post.message &&
                !post.image &&
                !post.permalink_url
            )
        ) {

            container.innerHTML = `
                <div class="fb-no-post">
                    Brak dostępnej aktualności z Facebooka.
                </div>
            `;

            return;
        }

        const date = formatDate(post.created_time);

        const title = createTitle(post.message);

        const message = formatMessage(
            post.message || ""
        );


        container.innerHTML = `

            <div class="news-date">
                ${escapeHtml(date)}
            </div>


            <h2>
                ${escapeHtml(title)}
            </h2>


            ${
                message
                    ? `<div class="fb-message">
                           ${message}
                       </div>`
                    : ""
            }


            ${
                post.image
                    ? `
                        <img
                            class="fb-image"
                            src="${escapeAttribute(post.image)}"
                            alt="Najnowsza publikacja DKS Czarni Kozłowa Góra"
                            loading="lazy"
                        >
                      `
                    : ""
            }


            ${
                post.permalink_url
                    ? `
                        <a
                            class="fb-button"
                            href="${escapeAttribute(post.permalink_url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Zobacz post na Facebooku
                        </a>
                      `
                    : ""
            }


            <p class="fb-source">
                <strong>Źródło:</strong>
                Facebook · DKS Czarni Kozłowa Góra
            </p>

        `;

    } catch (error) {

        console.error(
            "Facebook news error:",
            error
        );

        container.innerHTML = `

            <div class="error-msg">
                Nie udało się wczytać najnowszej aktualności.
            </div>

        `;

    }

});


function formatDate(value) {

    if (!value) {
        return "Najnowsza aktualność";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Najnowsza aktualność";
    }

    return new Intl.DateTimeFormat(
        "pl-PL",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


function createTitle(message) {

    if (!message) {
        return "Najnowsza aktualność";
    }

    const firstLine = message
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(Boolean);

    if (!firstLine) {
        return "Najnowsza aktualność";
    }

    const clean = firstLine
        .replace(/\s+/g, " ")
        .trim();

    if (clean.length <= 90) {
        return clean;
    }

    return clean
        .substring(0, 87)
        .trimEnd() + "...";

}


function formatMessage(message) {

    if (!message) {
        return "";
    }

    return escapeHtml(message)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\n/g, "<br>");

}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}