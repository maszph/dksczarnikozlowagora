const fs = require("fs");
const path = require("path");


const PAGE_ID = process.env.FB_PAGE_ID;

const ACCESS_TOKEN =
    process.env.FB_PAGE_ACCESS_TOKEN;


if (!PAGE_ID || !ACCESS_TOKEN) {

    console.error(
        "Brakuje FB_PAGE_ID lub FB_PAGE_ACCESS_TOKEN."
    );

    process.exit(1);

}


const API_VERSION = "v26.0";


const outputDir =
    path.join(process.cwd(), "data");


const outputFile =
    path.join(
        outputDir,
        "facebook-post.json"
    );


const imageFile =
    path.join(
        process.cwd(),
        "facebook-latest.jpg"
    );


async function main() {

    const fields = [
        "id",
        "message",
        "created_time",
        "permalink_url",
        "full_picture"
    ].join(",");


    const url =
        `https://graph.facebook.com/${API_VERSION}/${encodeURIComponent(PAGE_ID)}/posts` +
        `?fields=${encodeURIComponent(fields)}` +
        `&limit=1` +
        `&access_token=${encodeURIComponent(ACCESS_TOKEN)}`;


    console.log(
        "Pobieranie najnowszego posta z Facebooka..."
    );


    const response =
        await fetch(url);


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Facebook Graph API zwróciło błąd:"
        );

        console.error(
            JSON.stringify(
                data,
                null,
                2
            )
        );

        process.exit(1);

    }


    if (
        !data.data ||
        !data.data.length
    ) {

        console.log(
            "Facebook nie zwrócił żadnego posta."
        );


        fs.mkdirSync(
            outputDir,
            {
                recursive: true
            }
        );


        fs.writeFileSync(

            outputFile,

            JSON.stringify(
                {
                    id: null,
                    message: "",
                    created_time: null,
                    permalink_url: null,
                    image: null
                },
                null,
                2
            ) + "\n",

            "utf8"

        );


        process.exit(0);

    }


    const post =
        data.data[0];


    let localImage = null;


    if (post.full_picture) {

        try {

            console.log(
                "Pobieranie zdjęcia posta..."
            );


            const imageResponse =
                await fetch(
                    post.full_picture
                );


            if (imageResponse.ok) {

                const buffer =
                    Buffer.from(
                        await imageResponse.arrayBuffer()
                    );


                fs.writeFileSync(
                    imageFile,
                    buffer
                );


                localImage =
                    "facebook-latest.jpg";


                console.log(
                    "Zdjęcie zapisane jako facebook-latest.jpg"
                );

            } else {

                console.log(
                    "Nie udało się pobrać zdjęcia. Post zostanie opublikowany bez lokalnego zdjęcia."
                );

            }

        } catch (error) {

            console.log(
                "Błąd pobierania zdjęcia:",
                error.message
            );

        }

    }


    fs.mkdirSync(
        outputDir,
        {
            recursive: true
        }
    );


    const result = {

        id:
            post.id || null,

        message:
            post.message || "",

        created_time:
            post.created_time || null,

        permalink_url:
            post.permalink_url || null,

        image:
            localImage

    };


    fs.writeFileSync(

        outputFile,

        JSON.stringify(
            result,
            null,
            2
        ) + "\n",

        "utf8"

    );


    console.log(
        "Zapisano:",
        outputFile
    );


    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

}


main().catch(error => {

    console.error(
        "Nieoczekiwany błąd:",
        error
    );

    process.exit(1);

});