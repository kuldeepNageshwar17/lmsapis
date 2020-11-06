
const ROLE_LABLE = {
    SUPER_USER_LABLE:0,
    INSTITUTE_LABLE:1,
    BRANCH_LABLE:2,    
    STUDENT_LABLE:3,    
}
//Type 0 Mindproc
//type 1 Institute Level
//type 2 Branch Level

const ROLES = [
  {id:"111AMDIN", name: 'Institute-Admin', type: '1',isDefault:true,show:false},
  { id:"222Brach_admin",name: 'Branch-Admin', type: '2',isDefault:true},
  {id: '333Branch-Manager', name: 'Branch-Manager', type: '2' ,isDefault:true},
  {id: '4444Editor', name: 'Editor', type: '2',isDefault:true}
]

const COURSE_CONTENT_TYPES = {
  Video: 'video',
  Audio: 'audio',
  PDf: 'pdf',
  Image: 'image'
}

const QUESTION_TYPE = {
  "Multiple-Choice": 'multiple',
  "Single-Choice": 'single',
}




module.exports = {
  ROLES,
  COURSE_CONTENT_TYPES,
  ROLE_LABLE
}
