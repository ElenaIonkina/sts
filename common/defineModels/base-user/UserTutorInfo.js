module.exports = {
    id: Number,
    status: String,
    languages: [{
        selected: Boolean,
        language: String,
    }],
    subjects: [{
        selected: Boolean,
        subject: String,
    }],
    photoOfficialId: 'UrlPhoto',
    photoOfficialTranscript: 'UrlPhoto',
};
