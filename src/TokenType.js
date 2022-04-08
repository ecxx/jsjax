const TokenType = {

    EOF : 'EOF',
    LEFT_PEREN : 'LEFT_PEREN',
    RIGHT_PEREN : 'RIGHT_PEREN',
    LEFT_BRACE : 'LEFT_BRACE',
    RIGHT_BRACE : 'RIGHT_BRACE',
    LEFT_SQUARE : 'LEFT_SQUARE',
    RIGHT_SQUARE : 'RIGHT_SQUARE',
    COMMA : 'COMMA',
    DOT : 'DOT',
    COLON : 'COLON',
    
    ADD : '_add',
    ADD_EQUAL : '_addq',
    SUB : '_sub',
    SUB_EQUAL : '_subq',
    MUL : '_mul',
    MUL_EQUAL : '_mulq',
    EXP : '_exp',

    DIV : '_div',
    DIV_EQUAL : '_divq',
    MOD : '_mod',
    MOD_EQUAL : '_modq',

    EQUAL : 'EQUALS',
    EQUAL_EQUAL : '_eql',

    NEG : '_neg',
    NEG_EQUAL : '_neq',
    LESS_THAN : '_lt',
    GREATER_THAN : '_gt',
    LESS_EQUALS : '_leq',
    GREATER_EQUALS : '_geq',
    
    AND_AND : '_and',
    OR_OR : '_or',

    AND : '_andb',
    OR : '_orb',
    XOR : '_xor',
    NOT : '_not',
    LEFT_SHIFT : '_lsb',
    RIGHT_SHIFT : '_rsb',

    IDENTIFIER : 'IDENTIFIER',
    STRING : 'STRING',
    NUMBER : 'NUMBER',

    INCLUDE : 'INCLUDE',
    IF : 'IF',
    ELSE : 'ELSE',
    BREAK : 'BREAK',
    CONTINUE : 'CONTINUE',

    FOR : 'FOR',
    OF : 'OF',
    WHILE : 'WHILE',

    FUNCTION : 'FUNCTION',
    RETURN : 'RETURN',
    CLASS : 'CLASS',

    TRY : 'TRY',
    CATCH : 'CATCH',

    SWITCH : 'SWITCH',
    CASE : 'CASE',
    FALLTHROUGH : 'FALLTHROUGH',

    NULL : 'NULL',
    TRUE : 'TRUE',
    FALSE : 'FALSE',

    SEMICOLON : 'SEMICOLON'

}

module.exports = TokenType;