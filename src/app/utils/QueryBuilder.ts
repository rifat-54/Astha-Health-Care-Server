import { IQueryConfig, IQueryParams, IPrismaCountArgs, IPrismaFindManyArgs, IPrismaModelDelegate, IPrismaSingleFilter, IPrismaWhereConditions,  } from "../interface/query.interface";


export class QueryBuilder<
T,
TWhereInput=Record<string,unknown>,
TInclude=Record<string,unknown>
>{

    private query:IPrismaFindManyArgs;
    private countQuery:IPrismaCountArgs;
    private page:number=1;
    private limit:number=10;
    private skip:number=0;
    private sortBy:string ="createdAt";
    private sortOrder:'asc'|'dsc'='dsc';
    private selectFields:Record<string,boolean> | undefined



    constructor(
        private model:IPrismaModelDelegate,
        private queryParams:IQueryParams,
        private config:IQueryConfig
    ){
        this.query={
            where:{},
            include:{},
            orderBy:{},
            skip:0,
            take:10
        }

        this.countQuery={
            where:{}
        }
    }

    search():this{
        const{searchTerm}=this.queryParams
        const {searchableFields}=this.config

        if(searchTerm && searchableFields && searchableFields.length>0){
            const searchCondition:Record<string,unknown>[]=searchableFields.map((field)=>{
                if(field.includes(".")){
                    const parts=field.split(".")

                    if(parts.length===2){
                        const [relation,nestedField]=parts

                        const singleFilter:IPrismaSingleFilter={
                            contains:searchTerm,
                            mode:"insensitive"
                        }
                        return{
                            [relation]:{
                                [nestedField]:singleFilter
                            }
                        }
                    }else if(parts.length===3){
                        const[relation,nestedRelation,nestedField]=parts
                        const singleFilter:IPrismaSingleFilter={
                            contains:searchTerm,
                            mode:"insensitive"
                        }

                        return{
                            [relation]:{
                                some:{
                                    [nestedRelation]:{
                                        [nestedField]:singleFilter
                                    }
                                }
                            }
                        }
                    }


                }

                // direct field
                const singleFilter:IPrismaSingleFilter={
                    contains:searchTerm,
                    mode:"insensitive"
                }

                return{
                    [field]:singleFilter
                }
            })

        const whereConditions=this.query.where as IPrismaWhereConditions

        whereConditions.OR=searchCondition 

        const countWhereConditions=this.countQuery.where as IPrismaWhereConditions

        countWhereConditions.OR=searchCondition
    }

    return this

    }

   
     

}



