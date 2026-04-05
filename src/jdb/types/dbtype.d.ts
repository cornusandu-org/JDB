type DBDataType = {
    tables: Array<{
        name: string,
        index: Map<string, IndexType>,
        fields: Array<string>,
        strictfields: boolean,
        records: Map<Hash256Type, Map<string, unknown>>
    }>
};
