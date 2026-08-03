import { PrismaCountArgs, PrismaFindManyArgs } from "../interface/query.interface";


export class QueryBuilder<
T,
TWhereInput=Record<string,unknown>,
TInclude=Record<string,unknown>
>{

    private query:PrismaFindManyArgs;
    private countQuery:PrismaCountArgs;
    private page:number=1;
    private limit:number=10;
    private skip:number=0;
    private sortBy:string ="createdAt";
    private sortOrder:'asc'|'dsc'='dsc';
    private selectFields:Record<string,boolean> | undefined

}