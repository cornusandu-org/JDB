type DBDataType = {
    tables: Array<{
        name: string,
        index: Map<string, IndexType>,
        fields: Array<string>,
        strictfields: boolean,
        records: Map<UUIDv7, Map<string, unknown>>
    }>
};
