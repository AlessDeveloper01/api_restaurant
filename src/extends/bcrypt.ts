import bcrypt from 'bcrypt';

export class Bcrypt {
    static hash = async (password: string): Promise<string> => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hashSync(password, salt);
    }

    static compare = async (password: string, hash: string): Promise<boolean> => {
        return bcrypt.compareSync(password, hash);
    };
}