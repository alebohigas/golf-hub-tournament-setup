import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactInfo } from '@/data/mockData';
import { Mail, Phone, Building2 } from 'lucide-react';

interface ContactSectionProps {
  contactInfo: ContactInfo;
  contactWarning: string;
}

const ContactSection = ({ contactInfo, contactWarning }: ContactSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Contacto
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Info */}
        <Card className="shadow-card border-border/50 overflow-hidden">
          <div className="flex">
            <div className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-4 py-6 flex items-center justify-center">
              <span className="font-display font-bold text-sm [writing-mode:vertical-lr] rotate-180">
                {contactInfo.bankName}
              </span>
            </div>
            <CardContent className="flex-1 py-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Clabe interbancaria:</span>
                  <p className="font-mono text-sm font-medium">{contactInfo.clabe}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Cuenta:</span>
                  <p className="font-mono text-sm font-medium">{contactInfo.cuenta}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Nombre:</span>
                  <p className="text-sm font-medium">{contactInfo.nombre}</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Contact Details */}
        <Card className="shadow-card border-border/50">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <span className="text-xs text-muted-foreground">Correo electrónico:</span>
                <p className="text-sm font-medium break-all">{contactInfo.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <span className="text-xs text-muted-foreground">Teléfono:</span>
                <p className="text-sm font-medium">{contactInfo.telefono}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <span className="text-xs text-muted-foreground">Teléfono directo:</span>
                <p className="text-sm font-medium">{contactInfo.telefonoDirecto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <p className="text-center text-sm text-muted-foreground italic px-4">
        {contactWarning}
      </p>
    </div>
  );
};

export default ContactSection;
